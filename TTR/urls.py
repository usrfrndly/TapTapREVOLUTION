from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^game/', include('game.urls', namespace="game")),
    url(r'^admin/', include(admin.site.urls)),
)
if settings.DEBUG:
	urlpatterns += patterns('',
	                        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
		                        'document_root': settings.MEDIA_ROOT,
	                        }),
	                        url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
		                        'document_root': settings.STATIC_ROOT,
	                        }),
	)
	if settings.DEBUG:
urlpatterns += patterns('',
                        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
	                        'document_root': settings.MEDIA_ROOT,
                        }),
                        url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
	                        'document_root': settings.STATIC_ROOT,
                        }),
)
