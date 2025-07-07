// frontend/andon-dashboard/src/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';

const Dashboard = () => {
  const [stations, setStations] = useState({});
  const [dailyRecords, setDailyRecords] = useState({});
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [summary, setSummary] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // Initialize station data
  const initializeStations = useCallback(() => {
    const initialStations = {};
    for (let i = 1; i <= 18; i++) {
      const stationName = `Station${i}`;
      initialStations[stationName] = {
        id: i,
        name: stationName,
        production: { state: 1, faultTime: null, resolvedTime: null },
        maintenance: { state: 1, faultTime: null, resolvedTime: null },
        quality: { state: 1, faultTime: null, resolvedTime: null },
        store: { state: 1, faultTime: null, resolvedTime: null },
        actualCount: 0,
        totalDowntime: 0,
        currentDowntime: 0,
        activeFaults: new Set(),
        efficiency: 0,
        isActive: true,
        isAlive: true
      };
    }
    setStations(initialStations);
  }, []);

  // Fetch initial data from Express API
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch daily records for today's downtime
      const dailyResponse = await fetch(`${API_BASE_URL}/api/data/dailyrecord`);
      const dailyData = await dailyResponse.json();
      
      const dailyByStation = {};
      const today = new Date().toISOString().split('T')[0];
      
      dailyData.forEach(record => {
        if (record.todayDate === today) {
          dailyByStation[record.stationName] = record;
        }
      });
      
      setDailyRecords(dailyByStation);

      // Fetch bay details for station information
      const bayResponse = await fetch(`${API_BASE_URL}/api/data/baydetail`);
      const bayData = await bayResponse.json();
      
      setStations(prev => {
        const updated = { ...prev };
        bayData.forEach(bay => {
          if (updated[bay.stationName]) {
            updated[bay.stationName].actualCount = bay.actualCount;
            updated[bay.stationName].efficiency = bay.efficiency;
            updated[bay.stationName].isActive = bay.isActive;
            updated[bay.stationName].isAlive = bay.isAlive;
            updated[bay.stationName].totalDowntime = dailyByStation[bay.stationName]?.totalDowntime || 0;
          }
        });
        return updated;
      });

      // Fetch current unresolved faults
      const sectionResponse = await fetch(`${API_BASE_URL}/api/data/sectiondata?date=${today}`);
      const sectionData = await sectionResponse.json();
      
      setStations(prev => {
        const updated = { ...prev };
        sectionData.forEach(section => {
          if (!section.resolvedTime && updated[section.stationName]) {
            const callType = section.callType.toLowerCase();
            updated[section.stationName][callType].state = 0;
            updated[section.stationName][callType].faultTime = new Date(section.faultTime);
            updated[section.stationName].activeFaults.add(callType);
          }
        });
        return updated;
      });

      // Fetch dashboard summary
      const summaryResponse = await fetch(`${API_BASE_URL}/api/dashboard/summary`);
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  }, [API_BASE_URL]);

  // Socket.IO connection
  useEffect(() => {
    const connectSocket = () => {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"]
        }
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connected');
        setIsConnected(true);
      });
      
      newSocket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected');
        setIsConnected(false);
      });

      newSocket.on('connection_status', (data) => {
        console.log('Connection status:', data);
      });
      
      newSocket.on('station_update', (data) => {
        handleSocketMessage(data);
      });
      
      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });
      
      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [SOCKET_URL]);

  // Handle Socket.IO messages
  const handleSocketMessage = useCallback((message) => {
    console.log('Received socket message:', message);
    
    if (message.type === 'station_updates') {
      setStations(prev => {
        const updated = { ...prev };
        
        message.changes.forEach(change => {
          const station = updated[change.station];
          if (!station) return;
          
          const callType = change.callType.toLowerCase();
          const now = new Date();
          
          if (change.type === 'fault') {
            // Fault occurred
            station[callType].state = 0;
            station[callType].faultTime = new Date(change.time);
            station[callType].resolvedTime = null;
            station.activeFaults.add(callType);
            
            console.log(`🚨 Fault detected: ${change.station} - ${change.callType}`);
          } else if (change.type === 'resolved') {
            // Fault resolved
            station[callType].state = 1;
            station[callType].resolvedTime = new Date(change.time);
            station.activeFaults.delete(callType);
            
            // Calculate and add downtime
            if (station[callType].faultTime) {
              const downtime = (station[callType].resolvedTime - station[callType].faultTime) / (1000 * 60); // minutes
              station.totalDowntime += downtime;
            }
            
            console.log(`✅ Fault resolved: ${change.station} - ${change.callType}`);
          }
        });
        
        // Update actual count if provided
        if (message.stationData && message.stationData.actualCount !== undefined) {
          const station = updated[message.stationData.station];
          if (station) {
            station.actualCount = message.stationData.actualCount;
          }
        }
        
        return updated;
      });
    }
  }, []);

  // Send station update via Socket.IO
  const sendStationUpdate = useCallback((data) => {
    if (socket && socket.connected) {
      socket.emit('station_update', data);
    }
  }, [socket]);

  // Calculate current downtime for active faults
  const getCurrentDowntime = useCallback((station) => {
    let currentDowntime = 0;
    const now = new Date();
    
    station.activeFaults.forEach(callType => {
      if (station[callType].faultTime) {
        currentDowntime += (now - station[callType].faultTime) / (1000 * 60); // minutes
      }
    });
    
    return currentDowntime;
  }, []);

  // Get station background color based on active faults
  const getStationColor = useCallback((station) => {
    if (station.activeFaults.size > 0) {
      return 'bg-red-500';
    }
    if (!station.isActive) {
      return 'bg-gray-500';
    }
    if (!station.isAlive) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }, []);

  // Format time display
  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format duration in minutes to readable format
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}m`;
    }
  };

  // Manual fault testing functions
  const createTestFault = async (stationName, callType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sectiondata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationName,
          callType,
          faultTime: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log(`Test fault created: ${stationName} - ${callType}`);
      }
    } catch (error) {
      console.error('Error creating test fault:', error);
    }
  };

  // Prepare chart data
  const chartData = Object.values(stations).map(station => ({
    name: station.name.replace('Station', 'S'),
    actualCount: station.actualCount,
    efficiency: station.efficiency
  }));

  // Initialize on mount
  useEffect(() => {
    initializeStations();
    fetchInitialData();
  }, [initializeStations, fetchInitialData]);

  // Update current downtime every second for active faults
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(stationName => {
          if (updated[stationName].activeFaults.size > 0) {
            updated[stationName].currentDowntime = getCurrentDowntime(updated[stationName]);
          } else {
            updated[stationName].currentDowntime = 0;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [getCurrentDowntime]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Andon Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-white text-sm ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Stations</div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalStations}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Active Stations</div>
            <div className="text-2xl font-bold text-green-600">{summary.activeStations}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total Production</div>
            <div className="text-2xl font-bold text-blue-600">{summary.totalProduction}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Active Faults</div>
            <div className="text-2xl font-bold text-red-600">{summary.activeFaults}</div>
          </div>
        </div>
      )}

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {Object.values(stations).map(station => (
          <div 
            key={station.id} 
            className={`${getStationColor(station)} rounded-lg p-4 text-white shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl station-card`}
            onClick={() => {
              // Test fault creation on click (development only)
              if (process.env.NODE_ENV === 'development') {
                const callTypes = ['Production', 'Maintenance', 'Quality', 'Store'];
                const randomCallType = callTypes[Math.floor(Math.random() * callTypes.length)];
                createTestFault(station.name, randomCallType);
              }
            }}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{station.name}</h3>
              
              {/* Station Status Indicators */}
              <div className="flex justify-center space-x-1 mb-2">
                <div className={`status-indicator ${station.isActive ? 'status-active' : 'status-inactive'}`} 
                     title={station.isActive ? 'Active' : 'Inactive'} />
                <div className={`status-indicator ${station.isAlive ? 'status-active' : 'status-inactive'}`} 
                     title={station.isAlive ? 'Alive' : 'Dead'} />
              </div>
              
              {/* Actual Count */}
              <div className="bg-white bg-opacity-20 rounded p-2 mb-3">
                <div className="text-sm opacity-90">Count / Efficiency</div>
                <div className="text-xl font-bold">{station.actualCount}</div>
                <div className="text-sm">{station.efficiency.toFixed(1)}%</div>
              </div>

              {/* Call Type Status */}
              <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                {['production', 'maintenance', 'quality', 'store'].map(callType => (
                  <div key={callType} className={`p-1 rounded ${station[callType].state === 0 ? 'bg-red-700 fault-pulse' : 'bg-green-700'} transition-colors duration-300`}>
                    <div className="capitalize">{callType.substring(0, 4)}</div>
                    {station[callType].state === 0 && station[callType].faultTime && (
                      <div className="text-xs">
                        {formatTime(station[callType].faultTime)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Downtime Information */}
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="text-xs opacity-90">Total Downtime Today</div>
                <div className="text-sm font-semibold">{formatDuration(station.totalDowntime)}</div>
                {station.currentDowntime > 0 && (
                  <>
                    <div className="text-xs opacity-90 mt-1">Current Downtime</div>
                    <div className="text-sm font-semibold text-yellow-200 animate-pulse">
                      {formatDuration(station.currentDowntime)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Production Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Station Production & Efficiency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'actualCount' ? value : `${value.toFixed(1)}%`,
                name === 'actualCount' ? 'Production Count' : 'Efficiency'
              ]}
            />
            <Bar yAxisId="left" dataKey="actualCount" fill="#3B82F6" name="actualCount" />
            <Bar yAxisId="right" dataKey="efficiency" fill="#10B981" name="efficiency" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Status Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Normal Operation</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Active Fault</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span>Communication Lost</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Backend Connection:</span>
              <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>API Endpoint:</span>
              <span className="font-mono text-xs">{API_BASE_URL}</span>
            </div>
            <div className="flex justify-between">
              <span>Socket Endpoint:</span>
              <span className="font-mono text-xs">{SOCKET_URL}</span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2">
                💡 Development Mode: Click stations to simulate faults
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

