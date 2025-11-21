pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
        // Estimote UWB SDK
        maven("https://estimote.jfrog.io/artifactory/android-proximity-sdk/")
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven("https://estimote.jfrog.io/artifactory/android-proximity-sdk/")
    }
}


rootProject.name = "BeaconUWB"
include(":app")
