# ==============================================================================
# Special thank you to https://github.com/maxexcloo/LastDown/blob/master/function.py
# ==============================================================================
import codecs
import os
import subprocess
from twisted.python.util import println
from django.shortcuts import render
from gmusicapi.clients import Webclient, Mobileclient
import mutagen
from mutagen.easyid3 import EasyID3
import TTR.settings
from django.http import HttpResponse
import yaml
from game.models import DownloadedTrack
import json
from django.core.serializers.json import DjangoJSONEncoder


api = Mobileclient()
webCli = Webclient()
api.login(TTR.settings.UN, TTR.settings.P)
webCli.login(TTR.settings.UN, TTR.settings.P)




# TODO: Will want to separate these files.
# ==============================================================================
# Page Renderings
# 1) Search Page Rendering
# =============================================================================
# def index(request):
#

def search(request):
    pathtooutput = TTR.settings.STATIC_ROOT

    error = False  # title is the name field
    # If user submitted song searh form
    if 'title' in request.GET:
        title = request.GET['title']
        # If form was submitted but empty
        if not title:
            error = True
            resultMessage = 'You submitted an empty form'
            return render(request, 'game/SearchForm.html', {'error': True,
                                                            'resultMessage': resultMessage})
        # User submitted the search form sucessfully
        else:
            queryMessage = 'You searched for: %r' % request.GET['title']
            searchedSongId = searchForTrack(request.GET['title'])
            # Song available in google music catalogue
            if searchedSongId:
                # Output path to download the song to
                tracktitle = searchedSongId['artist'] + "-" + searchedSongId[
                    'title'] + ".mp3"

                song_path = pathtooutput + tracktitle

                common_log("search_results", "Attempting to download track to the path: " + pathtooutput)

                # Attempt to download the track with the specified id to the output path
                # A matching song id will be returned if the download was successful
                if searchedSongId == download_track(searchedSongId, pathtooutput):
                    common_log("search_results",
                               "Downloaded track " + searchedSongId['artist'] + " - " + searchedSongId['title'])

                    # gather more analytical information and enter the song  in the song databases
                    run_music_analyzers(song_path)

                    track_model_id = parse_analyzer_output(searchedSongId,
                                                           pathtooutput)  # Returns search form/ song selection page
                    return render(request, 'game/SearchForm.html',
                                  {'queryMessage': queryMessage, 'resultMessage': "We just downloaded " +
                                                                                  searchedSongId['artist'] + " - " +
                                                                                  searchedSongId['title'],
                                   'downloadedId': track_model_id})

                # did not successfully download the song
                else:
                    error = True
                    common_log("search_results", "Could not download the requested track")
                    return render(request, 'game/SearchForm.html',
                                  {'error': error, 'queryMessage': queryMessage,
                                   'resultMessage': 'We could not download the song you requested, please enter of a different one!'})

                    # song does not exist in google music's catalogue
            else:
                common_log("search_results", "Searched song does not exist in google catalogue")
                return render(request, 'game/SearchForm.html', {'queryMessage': queryMessage,
                                                                'resultMessage': 'That song is not in Google Musics catalogue. Please think of something more mainstream:',
                                                                'error': error})  # Return search form if user did not a submit form
    return render(request,
                  'game/SearchForm.html')  # ==============================================================================


# Backend Google Music Search
# 1) Search For Track
# 2) Download Tracks
# =============================================================================

def searchForTrack(text):
    result = api.search_all_access(text)
    if len(result) < 1 or len(result.get("song_hits")) < 1:
        return None
    else:
        songid = result['song_hits'][0]['track']
        println(songid)
        return songid


# Download Track
def download_track(songid, path):
    common_log("", "Downloading Track: " + songid['artist'] + " - " + songid['title'])

    # Download Track
    try:
        # Open Binary Mode File & Write Stream To File
        songFile = codecs.open(path, "wb")
        songFile.write(webCli.get_stream_audio(songid['storeId']))
        songFile.close()

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


# ==============================================================================
# # Common ##
# ==============================================================================



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
        songfile = EasyID3(path)

    # Add Missing ID3 Tags
    except mutagen.id3.ID3NoHeaderError:
        songfile = mutagen.File(path, easy=True)
        songfile.add_tags()

    # Set Tags
    songfile["artist"] = artist
    songfile["album"] = album
    songfile["title"] = title
    songfile["genre"] = genre
    songfile["tracknumber"] = track
    songfile["date"] = year
    print(songfile)
    # Save MP3
    songfile.save()


def run_music_analyzers(path_to_track):
    input_audio_path = path_to_track
    # streaming_extractor_output_file_path = os.path.abspath('game/static/game/scripts/streamingextractoroutputfile.yaml')
    streaming_extractor_output_file_path = os.path.abspath('game/static/game/scripts/streamingextractoroutputfile.yaml')
    # streaming_extractor_path = os.path.abspath('game/static/game/scripts/streaming_extractor')
    streaming_extractor_path = os.path.abspath('game/static/game/scripts/streaming_extractor')

    return_streaming_extractor = subprocess.Popen(
        [streaming_extractor_path, input_audio_path, streaming_extractor_output_file_path])
    print(return_streaming_extractor)


def parse_analyzer_output(searched_song_id, path):
    # with open('game/static/game/scripts/streamingextractoroutputfile.yaml', 'r') as f:
    with open('game/static/game/scripts/streamingextractoroutputfile.yaml', 'r') as f:
        doc = yaml.load(f)
        artist = doc['metadata']['tags']['artist']
        album = doc['metadata']['tags']['album']
        track = doc['metadata']['tags']['album']
        song_length = doc['metadata']['audio_properties']['length']
        chords_progression = doc['tonal']['chords_progression']
        bpm = doc['rhythm']['bpm']
        print(bpm)
        beats_position = doc['rhythm']['beats_position']
        print(beats_position)
        bpm_estimates = doc['rhythm']['bpm_estimates']
        print bpm_estimates
        f.close()

        # TODO: Get cover albums??!
        # searched_song_id['']
        tr = DownloadedTrack(title=track, artist=artist, album=album, length=song_length, bpm=bpm,
                             beats_position=beats_position, bpm_estimates=bpm_estimates,
                             chord_progression=chords_progression, song_file=path)
        tr.save()
        return tr.id


def index(request):
    # TODO:Come back here!
    # if 'downloadedId' in request.POST:
    # track_model_id = request.POST
    track_model_id = DownloadedTrack.objects.latest('id').id
    song_model1 = DownloadedTrack.objects.filter(id=track_model_id).values()

    song_model3 = json.dumps(list(song_model1), cls=DjangoJSONEncoder)
    #
    # print(song_model1)
    # print(song_model2)

    return render(request, "game/TapTapRevolution.html", {'song': song_model3})




