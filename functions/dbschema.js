let db = {
    users: [
        {
            userId: '',
            email: 'user@bugirl.com',
            handle: 'user',
            createDate: '2019-03-15T10:59:52.798Z',
            userImage: 'image/blah.jpg',
            bio: 'Hello, my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'Manila, PH'
        }
    ],
    plants: [
        {
            createDate: '2020-03-15T11:46:01.018Z',
            plantName: 'plantName',
            kingdom: 'kingdom',
            phylum: 'phylum',
            klass: 'klass',
            urder: 'urder',
            family: 'family',
            genus: 'genus',
            species: 'species',
            caption: 'caption',
            userHandle: 'userHandle',
            userImage: 'userImage',
            plantImg: 'plantImg',
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
          userHandle: 'user',
          plantId: 'kdjsfgdksuufhgkdsufky',
          body: 'nice one mate!',
          createDate: '2019-03-15T10:59:52.798Z'
        }
      ],
      notifications: [
        {
          recipient: 'user',
          sender: 'john',
          read: 'true | false',
          plantId: 'kdjsfgdksuufhgkdsufky',
          type: 'like | comment',
          createDate: '2019-03-15T10:59:52.798Z'
        }
      ]
};
const userDetails = {
    // Redux data
    credentials: {
        userId: 'mLQ8fPEMfWTINMPxdrYu6MQtbTj1',
        email: 'user3@bugirl.com',
        handle: 'user3',
        createDate: '2020-12-17T07:26:05.275Z',
        userImage: 'image/blah.jpg',
        bio: 'Hello, stranger',
        website: 'http://google.com',
        location: 'Manila, PH'
    },
    likes: [
        {
            userHandle: 'user',
            plantId: 'IzSYoh6eYi1Ir0MBStp5'
        },
        {
            userHandle: 'user',
            plantId: 'PzApfvz8F7SagjJvBBiA'
        }
    ]
};