from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^game/', include('game.urls', namespace="game")),
    url(r'^admin/', include(admin.site.urls)),
)