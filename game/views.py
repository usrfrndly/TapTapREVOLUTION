from django.shortcuts import render
import gmusicapi.session
from gmusicapi.utils import utils
from gmusicapi.clients import Musicmanager, Webclient, Mobileclient
from django.http import HttpResponse, HttpRequest
from twisted.python.util import println
import gmusicapi

def index(request):
    # Three separate clients handle pulling data from the Google Music API.
    # We must do separate login and authentication for each

    #==============================================================================

    # 1) Google Music Mobile API allows us to search their catalogue for a particular song

    #==============================================================================
    api = Mobileclient()

    api.login("jmh794@nyu.edu","lance1bass2goes2space911!")

    # Search for a keyword in the Google music catalogue    
    results = api.search_all_access("zoom", 10)
    if len(results) < 1 or len(results.get("song_hits")) < 1:
        return HttpResponse("No results. Search for a different keyword.")
    else:
        # Get the track id of the chosen song
        first_song_id = results.get("song_hits")[0]["track"]["nid"]

    id = api.add_aa_track(first_song_id)
    println(id)
    #===========================================================================
    # 2) Google Music Manager allows us to download tracks
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
        
