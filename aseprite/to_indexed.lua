-- Convert an RGB PNG to true pixel-art: indexed palette of N colors, no dithering.
-- Usage: aseprite -b --script-param src=in.png --script-param dst=out.png --script-param colors=32 --script to_indexed.lua
local src = app.params["src"]
local dst = app.params["dst"]
local colors = tonumber(app.params["colors"]) or 32

local spr = app.open(src)
if not spr then error("cannot open " .. tostring(src)) end
app.activeSprite = spr

app.command.ChangePixelFormat{
  format = "indexed",
  dithering = "none",
  rgbmap = "default",
  fitCriteria = "default",
  colors = colors,
}

spr:saveCopyAs(dst)
spr:close()
print("wrote " .. dst .. " (" .. colors .. " colors)")
