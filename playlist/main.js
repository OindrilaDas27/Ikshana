// Get the hash of the url

const hash = window.location.hash
  .substring(1)
  .split('&')
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
  console.log(hash)
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '754095ec83f74d30ac89dbd32a298582';
const redirectUri = 'http://localhost:5500/playlist';
const scopes = [
  'streaming',
  'user-modify-playback-state',
  'user-library-modify',
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    '%20'
  )}&response_type=token`;
}

// Set up the Web Playback SDK

let deviceId;

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: 'Just a Random Song',
    getOAuthToken: (cb) => {
      cb(_token);
    },
  });

  // Error handling
  player.on('initialization_error', (e) => console.error(e));
  player.on('authentication_error', (e) => console.error(e));
  player.on('account_error', (e) => console.error(e));
  player.on('playback_error', (e) => console.error(e));

  // Playback status updates
  player.on('player_state_changed', (state) => {
    if (
      state.paused &&
      state.position === 0 &&
      state.restrictions.disallow_resuming_reasons &&
      state.restrictions.disallow_resuming_reasons[0] === 'not_paused'
    ) {
      console.log('finished');
      getASong(happy);
    }
  });

  // Ready
  player.on('ready', (data) => {
    console.log('Ready with Device ID', data.device_id);
    deviceId = data.device_id;
  });

  // Connect to the player!
  player.connect();
};

// Play a specified track on the Web Playback SDK's device ID
function play(device_id, track) {
  $.ajax({
    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
    type: 'PUT',
    data: `{"uris": ["${track}"]}`,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
    },
    success: function (data) {
      console.log(data);
    },
  });
}
//3XabMu0mJaQmrqz57UkEZI
function getASong(mood) {
  const mood_data = {
    happy:
      '?seed_artists=7n2wHs1TKAczGzO7Dd2rGr&seed_artists=1dfeR4HaWDbWqFHLkxsg1d&seed_artists=0du5cEVh5yTK9QJze8zA0C&seed_genres=pop&seed_genres=rock&seed_genres=electronic&seed_tracks=4LRPiXqCikLlN15c3yImP7&seed_tracks=7MXVkk9YMctZqd1Srtv4MB&seed_tracks=3vqJY3pVELLIxqXXyI08yr',
    sad: '?seed_artists=5GnnSrwNCGyfAU4zuIytiS&seed_artists=4LLpKhyESsyAXpc4laK94U&seed_artists=3DiDSECUqqY1AuBP8qtaIa&seed_genres=pop&seed_genres=acoustic&seed_genres=country&seed_tracks=3XabMu0mJaQmrqz57UkEZI&seed_tracks=1Cvvo5SkAtCj1iiSmLzJ6K&seed_tracks=4NXXZjd4NObI6yK0JKaTEE',
    nervous:
      '?seed_artists=5GnnSrwNCGyfAU4zuIytiS&seed_artists=6LuN9FCkKOj5PcnpouEgny&seed_artists=3DiDSECUqqY1AuBP8qtaIa&seed_genres=pop&seed_genres=electronic&seed_genres=acoustic&seed_tracks=37ZJ0p5Jm13JPevGcx4SkF&seed_tracks=7MJQ9Nfxzh8LPZ9e9u68Fq&seed_tracks=6b8Be6ljOzmkOmFslEb23P',
    love: '?seed_artists=4YRxDV8wJFPHPTeXepOstw&seed_artists=36QJpDe2go2KgaRleHCDTp&seed_artists=4S9EykWXhStSc15wEx8QFK&seed_genres=pop&seed_genres=rock&seed_genres=blues&seed_tracks=44AyOl4qVkzS48vBsbNXaC&seed_tracks=0s26En1JoJhVj32vizElpA&seed_tracks=1smFN2CLqGROu0J0UyvDfL',
  };
  let random_offset = Math.floor(Math.random() * 20);

  $.ajax({
    url: `https://api.spotify.com/v1/recommendations/${mood_data[mood]}`,
    type: 'GET',
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
    },
    success: function (data) {
      let trackUri = data.tracks[random_offset].uri;

      play(deviceId, trackUri);
      $('#embed-uri').attr(
        'src',
        'https://open.spotify.com/embed/track/' + data.tracks[random_offset].id
      );
    },
  });
}
