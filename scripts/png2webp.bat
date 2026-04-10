@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    PNG to WebP Batch Converter
echo ========================================
echo.

REM Default settings
set "QUALITY=80"
set "DELETE_ORIGINAL=0"
set "TARGET_DIR=."

REM Parse arguments
:parse_args
if "%~1"=="" goto :start
if /i "%~1"=="-q" (
    set "QUALITY=%~2"
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-d" (
    set "DELETE_ORIGINAL=1"
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="--help" goto :show_help
set "TARGET_DIR=%~1"
shift
goto :parse_args

:start
echo Target: %TARGET_DIR%
echo Quality: %QUALITY%
echo Delete original: %DELETE_ORIGINAL%
echo.

REM Check ffmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ffmpeg not found. Please install and add to PATH.
    pause
    exit /b 1
)

REM Count files
set count=0
for /r "%TARGET_DIR%" %%f in (*.png) do (
    set /a count+=1
)

if %count% equ 0 (
    echo [INFO] No PNG files found.
    pause
    exit /b 0
)

echo Found %count% PNG files
echo.

REM Convert
set converted=0
set failed=0
for /r "%TARGET_DIR%" %%f in (*.png) do (
    set "input=%%f"
    set "output=%%~dpnf.webp"
    
    echo [!converted!/!count!] Converting: %%~nxf
    
    ffmpeg -y -i "!input!" -q:v %QUALITY% "!output!" >nul 2>&1
    
    if errorlevel 1 (
        echo     [FAILED]
        set /a failed+=1
    ) else (
        echo     [OK]
        set /a converted+=1
        
        REM Delete original
        if %DELETE_ORIGINAL% equ 1 (
            del "!input!"
            echo     [Deleted original]
        )
    )
)

echo.
echo ========================================
echo Conversion completed!
echo Success: %converted%
echo Failed: %failed%
echo ========================================
pause
exit /b 0

:show_help
echo.
echo Usage: png2webp.bat [options] [directory]
echo.
echo Options:
echo   -q number  Set WebP quality (0-100, default: 80)
echo   -d         Delete original PNG files after conversion
echo   -h, --help Show this help
echo.
echo Examples:
echo   png2webp.bat                    Convert current directory
echo   png2webp.bat -q 90              Convert with quality 90
echo   png2webp.bat -d                 Convert and delete originals
echo   png2webp.bat D:\images          Convert specified directory
echo   png2webp.bat -q 85 -d D:\images Convert with quality 85 and delete
echo.
pause
exit /b 0
