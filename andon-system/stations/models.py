from django.db import models
from django.utils import timezone

class BayDetail(models.Model):
    StationName = models.CharField(max_length=50, unique=True)
    PlannedCount1 = models.IntegerField(default=0)
    PlannedCount2 = models.IntegerField(default=0)
    PlannedCount3 = models.IntegerField(default=0)
    ActualCount = models.IntegerField(default=0)
    Efficiency = models.FloatField(default=0.00)
    ipAddress = models.CharField(max_length=100, null=True, blank=True)
    Topic = models.CharField(max_length=100, null=True, blank=True)
    isactive = models.BooleanField(default=True)
    isalive = models.BooleanField(default=True)
    DateCreated = models.DateTimeField(default=timezone.now)
    totalDowntime = models.FloatField(default=0.00)
    calltype_index_map = models.TextField(
        default='{"PMD":0,"Quality":2,"Store":6,"JMD":8,"Production":12}'
    )

    def __str__(self):
        return self.StationName


class DailyRecord(models.Model):
    id = models.AutoField(primary_key=True)
    StationName = models.ForeignKey(BayDetail, to_field="StationName", on_delete=models.CASCADE)
    TodayDate = models.DateField()
    Plan = models.IntegerField(default=0)
    ActualCount = models.IntegerField(default=0)
    Efficiency = models.FloatField(default=0.0)
    mDowntime = models.FloatField(default=0.0)
    pDowntime = models.FloatField(default=0.0)
    qDowntime = models.FloatField(default=0.0)
    sDowntime = models.FloatField(default=0.0)
    jDowntime = models.FloatField(default=0.0)
    totalDowntime = models.FloatField(default=0.0)
    shift = models.IntegerField(null=True)

    def __str__(self):
        return f"{self.StationName} - {self.TodayDate} - Shift {self.shift}"


class SectionData(models.Model):
    id = models.AutoField(primary_key=True)
    StationName = models.ForeignKey(BayDetail, to_field="StationName", on_delete=models.CASCADE)
    calltype = models.CharField(max_length=20)
    FaultTime = models.DateTimeField(null=True, blank=True)
    ResolvedTime = models.DateTimeField(null=True, blank=True)
    DateTime = models.DateTimeField(null=True, blank=True)
    Shift = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.StationName} - {self.calltype}"


class ShiftData(models.Model):
    StationName = models.OneToOneField(BayDetail, to_field="StationName", on_delete=models.CASCADE, primary_key=True)
    last_actual_count = models.IntegerField(default=0)
    shift1_actual = models.IntegerField(default=0)
    shift2_actual = models.IntegerField(default=0)
    shift3_actual = models.IntegerField(default=0)
    Date = models.DateTimeField()

    def __str__(self):
        return f"{self.StationName} - {self.Date}"


class ShiftConfig(models.Model):
    id = models.AutoField(primary_key=True)
    shift1_start = models.TimeField(default="05:30")
    shift1_end = models.TimeField(default="14:20")
    shift2_start = models.TimeField(default="14:20")
    shift2_end = models.TimeField(default="00:10")
    shift3_start = models.TimeField(default="00:10")
    shift3_end = models.TimeField(default="05:30")

    def __str__(self):
        return "ShiftConfig"


class ShiftBaselines(models.Model):
    id = models.AutoField(primary_key=True)
    StationName = models.ForeignKey(BayDetail, to_field="StationName", on_delete=models.CASCADE)
    Shift = models.IntegerField()
    Date = models.DateField()
    BaselineCount = models.IntegerField(default=0)
    CreatedAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('StationName', 'Shift', 'Date')

    def __str__(self):
        return f"{self.StationName} - Shift {self.Shift} - {self.Date}"
