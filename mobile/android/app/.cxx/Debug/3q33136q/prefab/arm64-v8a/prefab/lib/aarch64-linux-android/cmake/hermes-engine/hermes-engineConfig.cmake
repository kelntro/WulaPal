if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/Administrator/.gradle/caches/transforms-3/316248f3cb3056071ea537c033ca5dbb/transformed/jetified-hermes-android-0.73.3-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Administrator/.gradle/caches/transforms-3/316248f3cb3056071ea537c033ca5dbb/transformed/jetified-hermes-android-0.73.3-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

