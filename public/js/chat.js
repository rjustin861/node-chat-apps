var socket = io();

function scrollToBottom() {
  //Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');

  //Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight)
    messages.scrollTop(scrollHeight);
}

socket.on('connect', function() {
  console.log('Connected to server');
  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function(err) {
    if(err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No Error');
    }
  });
});

socket.on('updateUsersList', function(users) {
  console.log(users);

  let ol = jQuery('<ol></ol>');
  users.forEach(function(user) {
    let li = jQuery('<li></li>').text(user);
    ol.append(li);
  });

  jQuery('#users').html(ol);
});

socket.on('newMessage', function(message) {
  console.log('New message', message);

  // let timestamp = moment(message.createdAt).format('HH:mm');
  // let li = jQuery('<li></li>');
  // li.text(`${timestamp} ${message.from} : ${message.text}`);
  // jQuery('#messages').append(li);

  let timestamp = moment(message.createdAt).format('h:mm a');
  let template = jQuery('#message-template').html();
  let html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: timestamp
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
    console.log('Location message', message);

    // let timestamp = moment(message.createdAt).format('HH:mm');
    // let li = jQuery('<li></li>');
    // let a = jQuery(`<a target="_blank">${message.url}</a>`);
    // li.text(`${timestamp} ${message.from} : `);
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
    let timestamp = moment(message.createdAt).format('h:mm a');
    let template = jQuery('#location-message-template').html();
    let html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: timestamp
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

jQuery('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextBox = jQuery('[name=message]');

  socket.emit('createMessage', {
    text: messageTextBox.val()
  }, function() {
    messageTextBox.val('');
  });
});

var locationBtn = jQuery('#sendLocationBtn');
locationBtn.on('click', function(e) {
  locationBtn.attr('disabled', 'disabled').text('Sending Location');

  navigator.geolocation.getCurrentPosition(function(position) {
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
    locationBtn.removeAttr('disabled').text('Send Location');
  }, function() {
    locationBtn.removeAttr('disabled').text('Send Location');
    alert('Unable to fetch location');
  });
});
