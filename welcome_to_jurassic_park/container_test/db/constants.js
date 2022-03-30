exports.eventPayload = {
  name: 'House party',
  startDate: '2020-01-01T07:09:37.241Z',
  endDate: '2020-01-01T07:09:37.241Z',
  venue: {
    name: 'I am a venue',
    location: {
      coordinates: [-123.100761, 49.280659],
      type: 'Point'
    },
  },
  price: 100,
  description: 'kaboom',
  links: [
    {
      name: 'ticket',
      url: 'http://hello.com'
    }
  ],
  media: {
    coverPhoto: {
      url: 'http://someurl.com',
      size: { width: 100, height: 100 }
    }
  },
  tags: {
    hostTags: ['a', 'b', 'c']
  }
};

exports.eventPayload2 = {
  name: 'Building party',
  startDate: '2020-01-01T07:09:37.241Z',
  endDate: '2020-01-01T07:09:37.241Z',
  venue: {
    name: 'Not a venue',
    location: {
      coordinates: [-123.100761, 49.280659],
      type: 'Point'
    },
  },
  price: 0,
  description: 'moobak',
  links: [
    {
      name: 'ticket',
      url: 'http://vibevent.co'
    }
  ],
  media: {
    coverPhoto: {
      url: 'http://nourl.com'
    }
  },
  tags: {
    hostTags: ['d', 'e', 'f']
  }
};

exports.developerPayload = {
  [REDACTED]
};

exports.userPayload = {\
  [REDACTED]
};

exports.userPayload2 = {
  [REDACTED]
};
