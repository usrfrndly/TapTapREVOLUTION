from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
                       url(r'^playttr/$', views.playttr, name='playttr'),
                       url(r'^search/$', views.search, name='search'),
)