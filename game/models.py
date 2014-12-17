from django.db import models


class DownloadedTrack(models.Model):
	title = models.CharField(max_length=150)
	artist = models.CharField(max_length=150)
	album = models.CharField(max_length=150)
	length = models.FloatField()
	bpm = models.FloatField()
	beats_position = models.TextField()
	bpm_estimates = models.TextField()
	chord_progression = models.TextField(null=True)
	album_art_url = models.URLField(null=True)
	song_file = models.FileField(upload_to="songs", null=True)
	timestame = models.DateTimeField(auto_now_add=True)
