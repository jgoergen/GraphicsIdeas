# Simple cross-platform-ish Makefile for DemoFrameworkCPP
# Assumes raylib is installed system-wide. Adjust RAYLIB_* paths if necessary.

APP=demo
CXX?=g++
CXXFLAGS=-std=c++17 -O2 -Wall -Wextra -Iinclude -Idemos
LDFLAGS=

# Platform detection (basic)
UNAME_S:=$(shell uname -s)
ifeq ($(UNAME_S),Linux)
    LIBS=-lraylib -lGL -lm -lpthread -ldl -lrt -lX11
endif
ifeq ($(UNAME_S),Darwin)
    LIBS=-lraylib -framework OpenGL -framework Cocoa -framework IOKit -framework CoreVideo
endif

SRC=$(wildcard src/*.cpp demos/*.cpp)
OBJ=$(SRC:.cpp=.o)

all: $(APP)

$(APP): $(OBJ)
	$(CXX) $(OBJ) -o $@ $(LDFLAGS) $(LIBS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) $(APP)

.PHONY: all clean
