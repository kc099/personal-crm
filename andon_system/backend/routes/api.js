const express = require('express');
const router = express.Router();
const { Baydetail, DailyRecord, SectionData } = require('../models');
const DatabaseUtils = require('../utils/database');
const { Op } = require('sequelize');
const moment = require('moment');

// Get all baydetail data
router.get('/data/baydetail', async (req, res) => {
  try {
    const baydetails = await Baydetail.findAll({
      order: [['stationName', 'ASC']]
    });
    
    res.json(baydetails);
  } catch (error) {
    console.error('Error fetching baydetail data:', error);
    res.status(500).json({ error: 'Failed to fetch baydetail data' });
  }
});

// Get all daily record data
router.get('/data/dailyrecord', async (req, res) => {
  try {
    const records = await DailyRecord.findAll({
      order: [['todayDate', 'DESC'], ['stationName', 'ASC']]
    });
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching daily record data:', error);
    res.status(500).json({ error: 'Failed to fetch daily record data' });
  }
});

// Get section data with optional date filter
router.get('/data/sectiondata', async (req, res) => {
  try {
    const { date } = req.query;
    let whereClause = {};
    
    if (date) {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();
      
      whereClause.faultTime = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const sectionData = await SectionData.findAll({
      where: whereClause,
      order: [['faultTime', 'DESC']]
    });
    
    res.json(sectionData);
  } catch (error) {
    console.error('Error fetching section data:', error);
    res.status(500).json({ error: 'Failed to fetch section data' });
  }
});

// Create new baydetail entry
router.post('/baydetail', async (req, res) => {
  try {
    const {
      stationName,
      plannedCount = 0,
      actualCount = 0,
      efficiency = 0.0,
      ipAddress,
      isActive = true,
      isAlive = true
    } = req.body;
    
    // Validate required fields
    if (!stationName || !ipAddress) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'stationName and ipAddress are required'
      });
    }
    
    const baydetail = await Baydetail.create({
      stationName,
      plannedCount,
      actualCount,
      efficiency,
      ipAddress,
      isActive,
      isAlive
    });
    
    res.status(201).json(baydetail);
  } catch (error) {
    console.error('Error creating baydetail:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'Station name or IP address already exists'
      });
    }
    
    res.status(500).json({ error: 'Failed to create baydetail entry' });
  }
});

// Get station status (for individual station monitoring)
router.get('/station/:stationId/status', async (req, res) => {
  try {
    const { stationId } = req.params;
    const stationName = `Station${stationId}`;
    
    // Get or create bay detail with unique IP
    const stationIp = `192.168.1.${stationId}`;
    
    const [bayDetail, created] = await Baydetail.findOrCreate({
      where: { stationName },
      defaults: {
        plannedCount: 100,
        actualCount: 0,
        efficiency: 0.0,
        ipAddress: stationIp,
        isActive: true,
        isAlive: true
      }
    });
    
    // Get current unresolved faults
    const unresolvedFaults = await DatabaseUtils.getUnresolvedFaults(stationName);
    
    // Get today's daily record
    const { record: dailyRecord } = await DatabaseUtils.getOrCreateDailyRecord(stationName);
    
    // Format response similar to Django format for compatibility
    const responseData = `{1,0,1,0,1,0,1,${bayDetail.actualCount},0,0,0,0,1,0,0,0}`;
    
    res.json({
      data: responseData,
      station: {
        name: stationName,
        actualCount: bayDetail.actualCount,
        efficiency: bayDetail.efficiency,
        isActive: bayDetail.isActive,
        isAlive: bayDetail.isAlive,
        unresolvedFaults: unresolvedFaults.length,
        totalDowntime: dailyRecord.totalDowntime
      }
    });
    
  } catch (error) {
    console.error('Error fetching station status:', error);
    res.status(500).json({ error: 'Failed to fetch station status' });
  }
});

// Get station statistics
router.get('/station/:stationId/stats', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { days = 7 } = req.query;
    const stationName = `Station${stationId}`;
    
    const stats = await DatabaseUtils.getStationStats(stationName, parseInt(days));
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching station stats:', error);
    res.status(500).json({ error: 'Failed to fetch station statistics' });
  }
});

// Create section data entry (for manual fault logging)
router.post('/sectiondata', async (req, res) => {
  try {
    const {
      stationName,
      callType,
      faultTime,
      resolvedTime = null
    } = req.body;
    
    // Validate required fields
    if (!stationName || !callType || !faultTime) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'stationName, callType, and faultTime are required'
      });
    }
    
    const sectionData = await SectionData.create({
      stationName,
      callType,
      faultTime: new Date(faultTime),
      resolvedTime: resolvedTime ? new Date(resolvedTime) : null
    });
    
    res.status(201).json(sectionData);
  } catch (error) {
    console.error('Error creating section data:', error);
    res.status(500).json({ error: 'Failed to create section data entry' });
  }
});

// Resolve fault endpoint
router.put('/sectiondata/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedTime = new Date() } = req.body;
    
    const sectionData = await SectionData.findByPk(id);
    
    if (!sectionData) {
      return res.status(404).json({ error: 'Section data not found' });
    }
    
    if (sectionData.resolvedTime) {
      return res.status(400).json({ error: 'Fault already resolved' });
    }
    
    // Update resolved time
    sectionData.resolvedTime = new Date(resolvedTime);
    await sectionData.save();
    
    // Calculate and update downtime
    const downtimeMinutes = (sectionData.resolvedTime - sectionData.faultTime) / (1000 * 60);
    await DatabaseUtils.updateDowntime(
      sectionData.stationName, 
      sectionData.callType, 
      downtimeMinutes
    );
    
    res.json({
      message: 'Fault resolved successfully',
      sectionData,
      downtimeMinutes: downtimeMinutes.toFixed(2)
    });
    
  } catch (error) {
    console.error('Error resolving fault:', error);
    res.status(500).json({ error: 'Failed to resolve fault' });
  }
});

// Dashboard summary endpoint
router.get('/dashboard/summary', async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    // Get all stations
    const stations = await Baydetail.findAll({
      order: [['stationName', 'ASC']]
    });
    
    // Get today's records
    const dailyRecords = await DailyRecord.findAll({
      where: { todayDate: today }
    });
    
    // Get unresolved faults
    const unresolvedFaults = await SectionData.findAll({
      where: { resolvedTime: null }
    });
    
    // Calculate summary statistics
    const summary = {
      totalStations: stations.length,
      activeStations: stations.filter(s => s.isActive).length,
      totalProduction: stations.reduce((sum, s) => sum + s.actualCount, 0),
      averageEfficiency: stations.length > 0 ? 
        stations.reduce((sum, s) => sum + s.efficiency, 0) / stations.length : 0,
      totalDowntime: dailyRecords.reduce((sum, r) => sum + r.totalDowntime, 0),
      activeFaults: unresolvedFaults.length,
      faultsByType: {
        Production: unresolvedFaults.filter(f => f.callType === 'Production').length,
        Maintenance: unresolvedFaults.filter(f => f.callType === 'Maintenance').length,
        Quality: unresolvedFaults.filter(f => f.callType === 'Quality').length,
        Store: unresolvedFaults.filter(f => f.callType === 'Store').length
      }
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;