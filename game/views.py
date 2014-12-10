#==============================================================================
# Special thank you to https://github.com/maxexcloo/LastDown/blob/master/function.py
#==============================================================================
from __builtin__ import file, True
import codecs
import os
import sys
from time import time
from twisted.python.util import println

from django.contrib.messages.storage.base import Message
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render
from gmusicapi.clients import Musicmanager, Webclient, Mobileclient
import gmusicapi.clients
from gmusicapi.protocol import metadata
import gmusicapi.session
import gmusicapi.protocol
import mutagen
from mutagen.easyid3 import EasyID3

import TTR.settings


def index(request):
    # Three separate clients handle pulling data from the Google Music API.
    # We must do separate login and authentication for each

    #==============================================================================

    # 1) Search through Google Music
    #==============================================================================
    api = Mobileclient()

    api.login(TTR.settings.UN, TTR.settings.P)

    # Search for a keyword in the Google music catalogue
    
    if len(results) < 1 or len(results.get("song_hits")) < 1:
        return HttpResponse("No results. Search for a different keyword.")
    else:
        # Get the track id of the chosen song
        first_song_id = results.get("song_hits")[0]["track"]["nid"]

    id = api.add_aa_track(first_song_id)
    println(id)
    #===========================================================================
    # 2) Download tracks to the server
    #===========================================================================
    # For music manager, you will need  to use oauth,
    # and you should only have to generate the oauth once
    mm = Musicmanager()
    # Oauth would be stored locally at this path: gmusicapi.clients.OAUTH_FILEPATH
    # If this path is not empty, then you have stored oauth previously, but stil must verify that it goes through


    while gmusicapi.clients.OAUTH_FILEPATH == None and not mm.is_authenticated():
        mm.perform_oauth(gmusicapi.clients.OAUTH_FILEPATH,
                         True)  # If successful, this will save your credentials to disk. Then, future runs can start with:
    if gmusicapi.clients.OAUTH_FILEPATH != None and not mm.is_authenticated():
        success = mm.login(gmusicapi.clients.OAUTH_FILEPATH, uploader_id=None, uploader_name=None)
    (filename, audio) = mm.download_song(first_song_id)
    with open(filename, 'wb') as f:
        f.write(audio)

    wclient = Webclient()
    wclient.login("jmh794@nyu.edu", "lance1bass2goes2space911!")

# info = wclient.get_song_download_info(id)
#     info
#     return HttpResponse(url)




#==============================================================================
# # Common ##
#==============================================================================


# Directory Creation
def common_directories():
    gmusicapi.protocol.metadata.md_expectations
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
# Search for Tracks
# ==============================================================================
# Search Music & Find ID

def searchForTrack(text):
    try:
        result = Mobileclient.search_all_access(text)
        id = result['song_hits'][0]['track']
        path = TTR.settings.OUTPUT_FOLDER + "/" + id['artistId'][0] + " - " + id['storeId'] + ".mp3"
        pathal = TTR.settings.OUTPUT_FOLDER + "/" + id['artistId'][0] + " - " + id['albumId'] + "/" + id['artistId'][0] + " - " + id['storeId'] + ".mp3"
    # Search Error
    except:
        common_log("", "Track Not Found: " + text)

        return False
    
    
#     # Download Track
#     id = gmusic_download_track(id, path)
#     # Sleep For Rate Limit Period
#     time.sleep(TTR.settings.OUTPUT_FOLDER)
#     if id != None:
#         return True
#     else:
#         return False

# =============================================================================
# Download Tracks
#==============================================================================

# Download Album
def gmusic_download_album(id, path):
    common_log("", "Downloading Album: " + id['artist'] + " - " + id['name'])

    # Download Album
    try:
        # Check Directory & Create Directory
        if not os.path.isdir(path):
            os.makedirs(path)

        # Load Album & Download Tracks
        for idtr in Mobileclient.get_album_info(id['albumId'])['tracks']:
            pathtr = path + "/" + idtr['artistId'][0] + " - " + idtr['storeId'] + ".mp3"

            # Check If Track Exists
            if common_exist(pathtr):
                common_log("", "Track Already Exists: " + idtr['artist'] + " - " + idtr['title'])
            # Download Track
            else:
                gmusic_download_track(idtr, pathtr)
    # Download Error
    except:
        common_log("", "Download Error: " + id['artist'] + " - " + id['name'])

# Download Track
def gmusic_download_track(id, path):
    common_log("", "Downloading Track: " + id['artist'] + " - " + id['title'])

    # Download Track
    try:
        # Open Binary Mode File & Write Stream To File
        file = codecs.open(path, "wb")
        file.write(Webclient.get_stream_audio(id['storeId']))
        file.close()

        # Tag Track
        try:
            mutagen_edit(path, id['artist'], id['album'], id['title'], Mobileclient.get_track_info(id['storeId'])['genre'], str(id['trackNumber']), str(Mobileclient.get_album_info(id['albumId'])['year']))
        # Mutagen Error
        except:
            common_log("Mutagen", "Error Editing ID3 Tags: " + path)
        return id
    # Download Error
    except:
        common_log("", "Download Error: " + id['artist'] + " - " + id['title'])

        # Remove File
        try:
            os.remove(path)

        # Remove File Error
        except:
            common_log("", "Error Deleting: " + path)

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

    # Save MP3
    file.save()

# TODO: Will want to separate these files.

# ==============================================================================
# Search form
# ==============================================================================


def search(request):
    error = False
    #titles is the name field
    if 'title' in request.GET:
         title = request.GET['title']
         if not title:
             error = True
             resultMessage = 'You submitted an empty form'
             return render(request,'search_results.html', {'error':True,
            'resultMessage':resultMessage})
         else:
            queryMessage = 'You searched for: %r' % request.GET['title']
            downloadedId = searchForTrack(request.GET['title'])
            if downloadedId:
                #proceed to next step
                common_log("search_results", "Downloaded searched track")
                return render(request,'search_results.html', {'queryMessage':queryMessage,'resultMessage':'We have downloaded the track for you', 'downloadedId':downloadedId})
            else:
                error = True
                common_log("search_results", "Could not download that file")
                return render(request,'search_results.html', {'error':error,'queryMessage':queryMessage,
                'resultMessage':'We could not download that song, please submit a different one.'})
    return render(request, 'search_form.html', {'error':error})