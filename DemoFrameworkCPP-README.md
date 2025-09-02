# DemoFrameworkCPP Build & Installation Guide

This guide explains how to install prerequisites, build, and run the `DemoFrameworkCPP` project on Linux, macOS, and Windows (PowerShell, MSYS2, WSL), using either the provided Makefile or CMake (recommended for Windows / cross‑platform).

## 1. Overview

- Language: C++17
- Core library: [raylib](https://www.raylib.com/) (fast, simple 2D/3D)
- Build systems: Makefile (Unix-y), CMake (all platforms, integrates with vcpkg)
- Executable target: `demo`

## 2. Directory Layout (Relevant Parts)

```
DemoFrameworkCPP/
  CMakeLists.txt        # CMake build script
  Makefile              # Simple make build (Linux/macOS/MSYS2)
  vcpkg.json            # Dependencies manifest (raylib) for vcpkg
  include/              # Framework headers
  src/                  # Core framework + main
  demos/                # Individual demo implementations
```

## 3. Platform Setup

### 3.1 Linux

Choose the instructions matching your distribution.

#### Ubuntu / Debian

```bash
sudo apt update
sudo apt install -y build-essential cmake git pkg-config libraylib-dev
```

If `libraylib-dev` is outdated / missing:

```bash
git clone https://github.com/raysan5/raylib.git
cd raylib
mkdir build && cd build
cmake -DBUILD_SHARED_LIBS=ON ..
make -j$(nproc)
sudo make install
sudo ldconfig
```

#### Fedora

```bash
sudo dnf install -y @development-tools cmake git pkg-config raylib-devel
```

#### Arch / Manjaro

```bash
sudo pacman -S --needed base-devel cmake git raylib
```

### 3.2 macOS (Homebrew)

```bash
brew update
brew install raylib cmake git
```

Optionally install `make` (GNU) if you prefer over BSD make:

```bash
brew install make   # then use gmake instead of make
```

MacPorts alternative:

```bash
sudo port install raylib cmake git
```

### 3.3 Windows

You have multiple options. Pick ONE.

#### Option A: CMake + vcpkg (Recommended)

1. Install: Visual Studio Build Tools (MSVC) OR LLVM/Clang.
2. Install CMake: https://cmake.org/download/
3. Install vcpkg:

```powershell
# PowerShell
git clone https://github.com/microsoft/vcpkg.git $env:USERPROFILE\vcpkg
& $env:USERPROFILE\vcpkg\bootstrap-vcpkg.bat
```

4. (Optional) Integrate:

```powershell
& $env:USERPROFILE\vcpkg\vcpkg integrate install
```

5. Configure & build (from repository root):

```powershell
cmake -B build -S DemoFrameworkCPP -DCMAKE_TOOLCHAIN_FILE=$env:USERPROFILE\vcpkg\scripts\buildsystems\vcpkg.cmake -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel
```

6. Run:

```powershell
./build/Release/demo.exe
```

#### Option B: MSYS2 (MINGW64 environment)

1. Install MSYS2: https://www.msys2.org/
2. Open the "MSYS2 MINGW64" shell.
3. Install packages:

```bash
pacman -Syu --noconfirm
pacman -S --needed --noconfirm mingw-w64-x86_64-{gcc,cmake,raylib,make}
```

4. Build (Makefile):

```bash
cd /path/to/GraphicsIdeas/DemoFrameworkCPP
make -j$(nproc)
./demo.exe
```

5. Or use CMake:

```bash
cmake -B build -S . -G "MinGW Makefiles"
cmake --build build --config Release --parallel
./build/demo.exe
```

#### Option C: Windows Subsystem for Linux (WSL)

Follow the Linux (Ubuntu) section inside your WSL distro.

### 3.4 Optional: Static Linking (raylib)

Add `-DBUILD_SHARED_LIBS=OFF` when building raylib from source, then ensure linker finds static libs (may need extra system libs on Linux like `-lpthread -ldl -lm -lX11 -lrt`). CMake with vcpkg typically handles this automatically.

## 4. Building the Project

### 4.1 Using CMake (Cross‑Platform)

```bash
# From repo root
cmake -B build -S DemoFrameworkCPP -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel
# Run
./build/demo        # Linux/macOS
./build/Release/demo.exe  # Windows MSVC multi-config
```

Specify vcpkg toolchain on Windows if not integrated:

```powershell
cmake -B build -S DemoFrameworkCPP -DCMAKE_TOOLCHAIN_FILE=C:/path/to/vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel
```

### 4.2 Using Makefile (Linux/macOS/MSYS2)

```bash
cd DemoFrameworkCPP
make -j$(nproc)     # or just: make
./demo              # .exe on Windows/MSYS2
```

Clean:

```bash
make clean
```

## 5. Running

Launch the executable (`demo`). A text menu appears:

- Press number keys (1, 2, 3, ...) to start a demo.
- In a running demo:
  - `ESC` = return to menu
  - `R` = regenerate variable targets
  - `SPACE` = pause/resume tweening of variables

Overlay shows FPS and current variable values (value -> target).

## 6. Adding New Demos

1. Create `demos/MyDemo.hpp` & `demos/MyDemo.cpp` deriving from `BaseDemo`.
2. Implement `OnConfigureVariables` to register any variables.
3. In `src/main.cpp`, register: `app.Register({"My Demo", [](){ return new MyDemo(); }});`
4. Rebuild.

## 7. Variable System Summary

Each variable (DemoVariable):

- Fields: `value`, `target`, `min`, `max`, `transitionFrames`, flags (locked, integer, floored, ceiled)
- `Regenerate()` picks a new target using a provided generator or uniform range
- `Update()` linearly interpolates toward target over remaining frames
- Press `R` to regenerate (unlocked variables)

## 8. Troubleshooting

| Issue                                | Fix                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| raylib not found (CMake)             | Provide vcpkg toolchain or install system package; delete `build/` and reconfigure                                   |
| Link errors on Linux (X11 / pthread) | Ensure you installed `libraylib-dev` or built raylib with X11 support; add system libs if doing custom static build  |
| MSYS2 build picks wrong gcc          | Ensure you are in the `MINGW64` shell (prompt ends with `MINGW64`)                                                   |
| Blank window / no menu text          | Verify fonts draw (raylib default). Check that `BeginDrawing()/EndDrawing()` wraps rendering (already in framework). |
| Very slow performance on HiDPI mac   | Disable Retina scaling: add `SetConfigFlags(FLAG_WINDOW_HIGHDPI);` early or adjust window size                       |

## 9. Updating Dependencies

- vcpkg: `vcpkg upgrade --no-dry-run`
- Homebrew: `brew update && brew upgrade raylib`
- Source build: pull latest raylib, rebuild & reinstall

## 10. License Notes

raylib is zlib/libpng licensed. This framework code is currently unlicensed (inherits repository terms). Add a LICENSE file if you plan broader distribution.

## 11. Quick Copy/Paste Cheat Sheet

Linux/macOS quick build:

```bash
cmake -B build -S DemoFrameworkCPP -DCMAKE_BUILD_TYPE=Release && cmake --build build --parallel && ./build/demo
```

Windows PowerShell (vcpkg):

```powershell
cmake -B build -S DemoFrameworkCPP -DCMAKE_TOOLCHAIN_FILE=$env:USERPROFILE\vcpkg\scripts\buildsystems\vcpkg.cmake -DCMAKE_BUILD_TYPE=Release; cmake --build build --config Release --parallel; ./build/Release/demo.exe
```

---

Happy hacking! Add more demos and extend the variable/easing system as needed.
