# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'DownloadedTrack'
        db.create_table(u'game_downloadedtrack', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('artist', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('album', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('length', self.gf('django.db.models.fields.FloatField')()),
            ('bpm', self.gf('django.db.models.fields.FloatField')()),
            ('beats_position', self.gf('django.db.models.fields.TextField')()),
            ('bpm_estimates', self.gf('django.db.models.fields.TextField')()),
            ('chord_progression', self.gf('django.db.models.fields.TextField')(null=True)),
            ('album_art_url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True)),
            ('song_file', self.gf('django.db.models.fields.files.FileField')(max_length=100, null=True)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'game', ['DownloadedTrack'])


    def backwards(self, orm):
        # Deleting model 'DownloadedTrack'
        db.delete_table(u'game_downloadedtrack')


    models = {
        u'game.downloadedtrack': {
            'Meta': {'object_name': 'DownloadedTrack'},
            'album': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'album_art_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True'}),
            'artist': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'beats_position': ('django.db.models.fields.TextField', [], {}),
            'bpm': ('django.db.models.fields.FloatField', [], {}),
            'bpm_estimates': ('django.db.models.fields.TextField', [], {}),
            'chord_progression': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'length': ('django.db.models.fields.FloatField', [], {}),
            'song_file': ('django.db.models.fields.files.FileField', [], {'max_length': '100', 'null': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        }
    }

    complete_apps = ['game']