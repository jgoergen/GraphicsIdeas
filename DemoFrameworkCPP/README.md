# DemoFrameworkCPP

https://github.com/raysan5/raylib/wiki/

Cross-platform C++ framework (Linux / macOS / Windows) for quickly prototyping 2D graphics demos.

Uses: raylib (https://www.raylib.com/) for rendering.

Features

- Runtime demo menu and a small variable system used by demos
- Simple lifecycle for demos: OnConfigureVariables, OnInit, OnUpdate, OnDraw, OnShutdown
- Example demo: Cellular Automata

Quick status

- This repository can build raylib automatically (via FetchContent) or use a system/vcpkg-installed raylib.
- On Windows the CMake setup will copy required runtime DLLs and the `assets` folder into the executable folder after build.

Supported platforms

- Linux, macOS, Windows (Visual Studio/MSVC, MinGW, clang)

---

## Prerequisites

- CMake (>= 3.11). For MSVC runtime control prefer CMake >= 3.15.
- A C++ compiler toolchain:
  - Windows: Visual Studio 2019/2022 (MSVC) or MinGW
  - macOS: Xcode or clang
  - Linux: gcc/clang

Optional (recommended on Windows): vcpkg for dependency management.

---

## Recommended build flows

Below are the common ways to build. Use the one that matches your environment.

### 1) Use vcpkg on Windows (recommended)

Install and integrate vcpkg (one-time):

```powershell
# clone and bootstrap vcpkg (one-time)
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat
# install raylib via vcpkg (x64 example)
.\vcpkg install raylib:x64-windows
# integrate with CMake (one-time)
.\vcpkg integrate install
```

Configure and build the project using the vcpkg toolchain:

```powershell
cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE="C:/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake" -A x64
cmake --build build --config Release
```

### 2) Use system-installed raylib (Linux / macOS)

Linux (Ubuntu example):

```bash
sudo apt install build-essential cmake pkg-config libraylib-dev
cmake -B build -S .
cmake --build build --config Release
./build/demo
```

macOS (Homebrew):

```bash
brew install raylib cmake
cmake -B build -S .
cmake --build build --config Release
./build/demo
```

### 3) Use a manually installed raylib on Windows

If you have raylib installed at `C:\raylib`, point CMake at the install directory (the folder containing `raylibConfig.cmake` or the `lib`/`bin` layout):

```powershell
cmake -B build -S . -Draylib_DIR="C:/raylib/lib/cmake/raylib" -A x64
cmake --build build --config Release
```

Alternatively set CMAKE_PREFIX_PATH:

```powershell
cmake -B build -S . -DCMAKE_PREFIX_PATH="C:/raylib" -A x64
cmake --build build --config Release
```

### 4) Let the project fetch and build raylib automatically

The top-level `CMakeLists.txt` will FetchContent raylib if it cannot be found. That works out of the box but will build raylib as part of your project which may take additional time on the first build:

```powershell
cmake -B build -S . -A x64
cmake --build build --config Release
```

Useful CMake flags

- `-DBUILD_SHARED_LIBS=ON` — build raylib as DLL/shared library
- `-DCMAKE_MSVC_RUNTIME_LIBRARY=MultiThreadedDLL` — force MSVC /MD runtime (helps avoid CRT mismatch)

---

## Run

After building, run the executable (Windows example):

```powershell
cd build\Release
.\demo.exe
```

On Unix-like:

```bash
./build/demo
```

Note: On Windows the build rules copy `raylib.dll` and the `assets` folder into the executable directory automatically when raylib is built as a CMake target by the project. If you use an external prebuilt raylib (not a CMake target in the current build), you may need to copy the DLL into the exe folder or add its containing folder to your PATH.

---

## Troubleshooting

- "The code execution cannot proceed because raylib.dll was not found"
  - Cause: Windows cannot find the raylib DLL beside the exe or on PATH.
  - Quick fix: copy the built `raylib.dll` into the same folder as the executable (Release example):

```powershell
Get-ChildItem -Path .\build -Filter raylib.dll -Recurse | ForEach-Object { Copy-Item $_.FullName -Destination .\build\Release\ -Force }
```

- Better: configure the project so it builds raylib as a target (FetchContent or vcpkg) so CMake's POST_BUILD step will copy it for you.

- "CMake cannot find raylib (raylib not found)"

  - Cause: CMake didn't find a `raylibConfig.cmake` or pkg-config entry.
  - Fixes:
    - If you have a raylib CMake package, pass `-Draylib_DIR="C:/raylib/lib/cmake/raylib"` (adjust path) to `cmake`.
    - Or set `-DCMAKE_PREFIX_PATH="C:/raylib"`.
    - Or install raylib with vcpkg and use the vcpkg toolchain.

- Linker errors with unresolved CRT symbols (e.g., `__imp_realloc`, `__imp_fopen`)

  - Cause: mixing different MSVC runtimes (static `/MT` vs dynamic `/MD`) between raylib and your executable.
  - Fix: rebuild raylib and your project with the same runtime. For MSVC use `-DCMAKE_MSVC_RUNTIME_LIBRARY=MultiThreadedDLL` (for `/MD`) or `MultiThreaded` (for `/MT`).

- Architecture/toolchain mismatch (x64 vs Win32, MSVC vs MinGW)

  - Ensure raylib and your project are built for the same architecture and toolchain. For Visual Studio generators pass `-A x64` or `-A Win32` accordingly.

- Using pkg-config on Windows

  - pkg-config is not always available on Windows toolchains; prefer CMake config-mode packages or vcpkg.

- For reproducible CI builds
  - Use vcpkg and pass the vcpkg toolchain file to CMake.

---

## Cleaning

To remove CMake outputs completely:

```powershell
Remove-Item -Recurse -Force .\build
```

---

## Where to look next

- Source: `src/` and `demos/`.
- CMake: `CMakeLists.txt` (controls fetch/build/install behavior). The CMake file includes logic to copy the built `raylib` target DLL and refresh the `assets` folder into the executable directory on Windows.

If you'd like, I can also:

- Add an option to control whether assets are copied (ON/OFF).
- Add a CMake fallback that searches the build tree for any `raylib.dll` and copies it even if raylib isn't a target.
- Add example commands for MinGW instead of MSVC.
