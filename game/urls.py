from django.conf.urls import patterns, url

from game import views

urlpatterns = patterns('',
<<<<<<< HEAD
                       url(r'^$', views.index, name='index'),
=======
                       url(r'^playttr/$', views.playttr, name='playttr'),
>>>>>>> 5ff94f519ac28607774c68d9e2586f8e8c28dc2e
                       url(r'^search/$', views.search, name='search'),
)