# ==============================================================================
# Special thank you to https://github.com/maxexcloo/LastDown/blob/master/function.py
# ==============================================================================
import codecs
import httplib
import os
import subprocess

from twisted.python.util import println
from django.shortcuts import render
from gmusicapi.clients import Webclient, Mobileclient
import mutagen
from mutagen.easyid3 import EasyID3
import TTR.settings
from subprocess import call
from django.templatetags.static import static
from django.http import HttpResponse
import yaml


api = Mobileclient()
webCli = Webclient()
api.login(TTR.settings.UN, TTR.settings.P)
webCli.login(TTR.settings.UN, TTR.settings.P)


def playttr(request):
	return render(request, "game/TapTapRevolution.html")


# TODO: Will want to separate these files.
# ==============================================================================
# Page Renderings
# 1) Search Page Rendering
# =============================================================================
def index(request):
	run_music_analyzers()
	return HttpResponse("Check the fieles")


def search(request):
	error = False
	#titles is the name field
	if 'title' in request.GET:
		title = request.GET['title']
		if not title:
			error = True
			resultMessage = 'You submitted an empty form'
			return render(request, 'game/SearchForm.html', {'error': True,
			                                                'resultMessage': resultMessage})
		else:
			queryMessage = 'You searched for: %r' % request.GET['title']
			downloadedId = searchForTrack(request.GET['title'])
			if downloadedId:
				path = TTR.settings.OUTPUT_FOLDER + "/" + downloadedId['artistId'][0] + " - " + downloadedId[
					'storeId'] + ".mp3"
				common_log("search_results", "path" + path)
				download_track(downloadedId, path)
				common_log("search_results", "Downloaded searched track")
				return render(request, 'game/SearchForm.html',
				              {'queryMessage': queryMessage, 'resultMessage': 'We have downloaded the track for you',
				               'downloadedId': downloadedId})
			else:
				error = True
				common_log("search_results", "Could not download that file")
				return render(request, 'game/SearchForm.html', {'error': error, 'queryMessage': queryMessage,
				                                                'resultMessage': 'We could not download that song, please submit a different one.'})
	return render(request, 'game/SearchForm.html', {'error': error})


#==============================================================================
# Backend Google Music Search
# 1) Search For Track
# 2) Download Tracks
# =============================================================================

def searchForTrack(text):
	result = api.search_all_access(text)
	if len(result) < 1 or len(result.get("song_hits")) < 1:
		return False
	else:
		songid = result['song_hits'][0]['track']
		path = TTR.settings.OUTPUT_FOLDER + "/" + songid['artistId'][0] + " - " + songid['storeId'] + ".mp3"
		pathal = TTR.settings.OUTPUT_FOLDER + "/" + songid['artistId'][0] + " - " + songid['albumId'] + "/" + \
		         songid['artistId'][0] + " - " + songid['storeId'] + ".mp3"
		println(songid)
		return songid


# Download Track
def download_track(songid, path):
	common_log("", "Downloading Track: " + songid['artist'] + " - " + songid['title'])

	# Download Track
	try:
		# Open Binary Mode File & Write Stream To File
		file = codecs.open(path, "wb")
		file.write(webCli.get_stream_audio(songid['storeId']))
		file.close()

		# Tag Track
		try:
			mutagen_edit(path, songid['artist'], songid['album'], songid['title'],
			             api.get_track_info(songid['storeId'])['genre'], str(songid['trackNumber']),
			             str(api.get_album_info(songid['albumId'])['year']))
		# Mutagen Error
		except:
			common_log("Mutagen", "Error Editing ID3 Tags: " + path)
		return songid
	# Download Error
	except:
		common_log("", "Download Error: " + songid['artist'] + " - " + songid['title'])

		# Remove File
		try:
			os.remove(path)

		# Remove File Error
		except:
			common_log("", "Error Deleting: " + path)


#==============================================================================
# # Common ##
#==============================================================================

# Directory Creation
def common_directories():
	# Check If Directory Exists
	if not os.path.exists(TTR.settings.OUTPUT_FOLDER):
		# Create Directory
		os.makedirs(TTR.settings.OUTPUT_FOLDER)

	# Check If Directory Exists
	if not os.path.exists(TTR.settings.OUTPUT_FOLDER):
		# Create Directory
		os.makedirs(TTR.settings.OUTPUT_FOLDER)


# Existence Check
def common_exist(path):
	# Check If Path Is File
	if os.path.isfile(path):
		# Check Path File Size
		if os.path.getsize(path) != 0:
			# Return True If Not Null
			return True

	# Return False
	return False


# Logging Function
def common_log(type, text):
	# Print Message With Category
	if type != "":
		print "[" + type + "] " + text
	# Print Message Without Category
	else:
		print text


# ==============================================================================
# Audio Metadata
# ==============================================================================

# Edit MP3 ID3 Tags
def mutagen_edit(path, artist, album, title, genre, track, year):
	# Open MP3
	try:
		file = EasyID3(path)
	# Add Missing ID3 Tags
	except mutagen.id3.ID3NoHeaderError:
		file = mutagen.File(path, easy=True)
		file.add_tags()

	# Set Tags
	file["artist"] = artist
	file["album"] = album
	file["title"] = title
	file["genre"] = genre
	file["tracknumber"] = track
	file["date"] = year
	print(file)
	# Save MP3
	file.save()


def run_music_analyzers():
	input_audio_path = os.path.abspath('game/static/game/music/03 - Overload.mp3')
	streaming_extractor_output_file_path = os.path.abspath('game/static/game/scripts/streamingextractoroutputfile.yaml')
	streaming_rhythm_extractor_output_file_path = os.path.abspath('game/static/game/scripts/streamingrhythmextractoroutputfile.yaml')

	streaming_tuning_extractor_output_file_path = os.path.abspath('game/static/game/scripts/streamingtuningextractoroutputfile.yaml')

	streaming_extractor_path = os.path.abspath('game/static/game/scripts/streaming_extractor')
	streaming_rhythm_extractor_path = os.path.abspath('game/static/game/scripts/streaming_rhythmextractor_multifeature')
	streaming_tuning_extractor_path = os.path.abspath('game/static/game/scripts/streaming_tuningfrequency')
	return_streaming_extractor = subprocess.Popen(
		[streaming_extractor_path, input_audio_path, streaming_extractor_output_file_path])
	print(return_streaming_extractor)

	# do we pipe them to ouput?
	return_streaming_rhythm_extractor = subprocess.Popen([streaming_rhythm_extractor_path, input_audio_path])
	print(return_streaming_rhythm_extractor)

	return_streaming_tuning_extractor = subprocess.Popen([streaming_tuning_extractor_path, input_audio_path])
	print(return_streaming_tuning_extractor)

def parse_analyzer_output():
	with open('game/static/game/scripts/streamingextractoroutputfile.yaml', 'r') as f:
		doc = yaml.load(f)
		bpm = doc['rhythm']['bpm']
		print(bpm)
		beats_position = doc['rhythm']['beats_position']
		print(beats_position)
		bpm_estimates = doc['rhythm']['bpm_estimates']
		print bpm_estimates
	f.close()


