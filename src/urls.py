from django.urls import path
from .views import cluster_students

urlpatterns = [
    path('api/cluster/', cluster_students),
]
