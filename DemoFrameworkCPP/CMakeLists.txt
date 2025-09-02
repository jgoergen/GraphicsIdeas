cmake_minimum_required(VERSION 3.11) # FetchContent is available in 3.11+
project(DemoFrameworkCPP)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# On MSVC, ensure we use the DLL runtime to match dependencies built with /MD
if(MSVC)
    # CMake 3.15+ supports this variable; force it so FetchContent-built subprojects use same CRT
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreadedDLL" CACHE STRING "" FORCE)
endif()

# Generate compile_commands.json
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Dependencies
set(RAYLIB_VERSION 5.5)
find_package(raylib ${RAYLIB_VERSION} QUIET) # QUIET or REQUIRED

if(NOT raylib_FOUND) # If there's none, fetch and build raylib
    include(FetchContent)
    FetchContent_Declare(
        raylib
        DOWNLOAD_EXTRACT_TIMESTAMP OFF
        URL https://github.com/raysan5/raylib/archive/refs/tags/${RAYLIB_VERSION}.tar.gz
    )
    FetchContent_GetProperties(raylib)

    if(NOT raylib_POPULATED) # Have we downloaded raylib yet?
        set(FETCHCONTENT_QUIET NO)
        FetchContent_MakeAvailable(raylib)
    endif()
endif()

file(GLOB SRC
    src/*.cpp
    demos/*.cpp
)

# Ensure newly added MetaBallsDemos.cpp included (debug message)
message(STATUS "Sources: ${SRC}")

# Our Project
add_executable(demo ${SRC})
target_include_directories(demo PRIVATE include demos)

# set(raylib_VERBOSE 1)
target_link_libraries(demo raylib)

# On Windows, copy runtime DLLs (raylib) next to the exe and ensure assets are copied
if(WIN32)
    # If raylib is a CMake target (FetchContent or imported target), copy its built DLL next to the demo exe
    if(TARGET raylib)
        add_custom_command(TARGET demo POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E echo "Copying raylib DLL to executable folder..."
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
            $<TARGET_FILE:raylib>
            $<TARGET_FILE_DIR:demo>
        )
    endif()

    # If an 'assets' folder exists in the project root, remove the target assets folder and copy the source assets
    if(EXISTS "${CMAKE_SOURCE_DIR}/assets")
        add_custom_command(TARGET demo POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E echo "Refreshing assets in executable folder..."
            COMMAND ${CMAKE_COMMAND} -E remove_directory $<TARGET_FILE_DIR:demo>/assets
            COMMAND ${CMAKE_COMMAND} -E make_directory $<TARGET_FILE_DIR:demo>/assets
            COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CMAKE_SOURCE_DIR}/assets"
            $<TARGET_FILE_DIR:demo>/assets
        )
    endif()
endif()

# Web Configurations
if(${PLATFORM} STREQUAL "Web")
    set_target_properties(demo PROPERTIES SUFFIX ".html") # Tell Emscripten to build an example.html file.
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s USE_GLFW=3 -s ASSERTIONS=1 -s WASM=1 -s ASYNCIFY -s GL_ENABLE_GET_PROC_ADDRESS=1")
endif()

# Checks if OSX and links appropriate frameworks (Only required on MacOS)
if(APPLE)
    target_link_libraries(${PROJECT_NAME} "-framework IOKit")
    target_link_libraries(${PROJECT_NAME} "-framework Cocoa")
    target_link_libraries(${PROJECT_NAME} "-framework OpenGL")
endif()