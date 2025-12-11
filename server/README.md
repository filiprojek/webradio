# Caster API

This service manages audio streaming to an Icecast server using FFmpeg. It supports microphone streaming, file playback, playlists, and live interruption of playlists using the microphone.
All interactions happen through a simple HTTP API.

---

## Base URL

```
http://<server>:8001
```

---

# API Reference

## Status

### GET /status

Returns the full current state of the caster, including:

* mode: `idle`, `mic`, or `playlist`
* active FFmpeg process PID (if any)
* current playlist index and item ID
* list of all playlist items
* whether the playlist was interrupted by microphone usage
* last error (if any)

Used by clients to poll and update UI state.

---

# Microphone Control

### POST /mic/start

Starts live microphone streaming to Icecast.

Behavior:

* Stops any running FFmpeg process.
* If a playlist is active, marks the playlist as interrupted.
* Starts a new FFmpeg process reading from the configured ALSA device.
* Sets mode to `mic`.

### POST /mic/stop

Stops microphone streaming.

Behavior:

* Stops the current FFmpeg process.
* If the microphone had interrupted a playlist, resumes playlist playback from the same index.
* Otherwise switches to idle mode.

---

# Playlist Management

### GET /playlist

Returns:

* the current playlist array
* current playlist index
* currently playing item ID

### POST /playlist

Adds a new track to the playlist.

Request body:

```
{
  "file": "relative/path/to/media.mp3",
  "title": "Optional display title"
}
```

Behavior:

* Validates that the file exists under the media directory.
* Appends a new playlist item with a generated ID.

### DELETE /playlist/:id

Removes a playlist item by ID.

Behavior:

* If the removed item is currently playing, playback stops and mode resets to idle.
* Removes the item from the playlist array.
* Adjusts playlist indices accordingly.

### POST /playlist/reorder

Reorders playlist items.

Request body:

```
{
  "from": <number>,
  "to": <number>
}
```

Behavior:

* Moves the item at index `from` to index `to`.

---

# Playlist Playback Control

### POST /playlist/start

Starts playlist playback.

Optional request body:

```
{
  "index": <number>
}
```

Behavior:

* Clears any microphone interruption flags.
* Stops any current FFmpeg process.
* Starts playback from the given index (default is 0).
* Sets mode to `playlist`.

### POST /playlist/stop

Stops playlist playback.

Behavior:

* Stops the FFmpeg process if running in playlist mode.
* Resets playback index and playing item ID.
* Sets mode to `idle`.

### POST /playlist/next

Skips to the next track in the playlist.

Behavior:

* Stops the current track.
* Advances to the next index if available.
* If no next track exists, switches to idle mode.

---

# Global Control

### POST /stop

Stops all playback regardless of mode.

Behavior:

* Terminates any running FFmpeg process.
* Resets state to idle.
* Clears interruption flags and playlist index.
