// All site content lives here. Edit this file, restart the server, done.
// Dates are ISO strings with a UTC offset so countdowns and calendar files are exact.

module.exports = {
  couple: {
    partner1: { first: 'Eleanor', last: 'Hart' },
    partner2: { first: 'James', last: 'Okafor' },
  },
  hashtag: '#HartOkaforEverAfter',
  timezone: 'America/New_York',

  // The main event. Drives the hero, countdown, and calendar file.
  wedding: {
    start: '2027-06-12T16:00:00-04:00',
    end: '2027-06-12T23:00:00-04:00',
    venue: 'Clermont Farm',
    address: '1 Clermont Ave, Germantown, NY 12526',
    cityLine: 'Hudson Valley, New York',
    mapsQuery: 'Clermont State Historic Site, Germantown, NY',
  },

  hero: {
    eyebrow: 'Together with their families',
    image: '/images/hero.jpg',
    imageAlt: 'Wildflowers in soft afternoon light',
  },

  rsvp: {
    open: true,
    deadline: '2027-04-30',
    contactEmail: 'hello@example.com',
    mealOptions: ['Herb-roasted chicken', 'Pan-seared salmon', 'Wild mushroom risotto (vegetarian)', 'Kids meal'],
  },

  // Events. Those with `rsvp: true` appear in the RSVP form. `meal: true` asks for an entrée.
  schedule: [
    {
      key: 'welcome',
      name: 'Welcome Drinks',
      start: '2027-06-11T19:00:00-04:00',
      end: '2027-06-11T22:00:00-04:00',
      venue: 'The Maker Hotel Lounge',
      address: '302 Warren St, Hudson, NY 12534',
      mapsQuery: 'The Maker Hotel, Hudson NY',
      dress: 'Cocktail',
      description: 'Come say hello the night before. Drinks and light bites on us. Drop in whenever you arrive.',
      rsvp: true,
    },
    {
      key: 'ceremony',
      name: 'Ceremony',
      start: '2027-06-12T16:00:00-04:00',
      end: '2027-06-12T16:45:00-04:00',
      venue: 'Clermont Farm, the West Lawn',
      address: '1 Clermont Ave, Germantown, NY 12526',
      mapsQuery: 'Clermont State Historic Site, Germantown, NY',
      dress: 'Garden formal',
      description: 'Please arrive by 3:30 to find a seat. The ceremony is outdoors on grass, so consider your footwear.',
      rsvp: true,
      meal: true,
      groupWith: 'reception',
    },
    {
      key: 'reception',
      name: 'Cocktails, Dinner & Dancing',
      start: '2027-06-12T17:00:00-04:00',
      end: '2027-06-12T23:00:00-04:00',
      venue: 'Clermont Farm, the Barn',
      address: '1 Clermont Ave, Germantown, NY 12526',
      mapsQuery: 'Clermont State Historic Site, Germantown, NY',
      dress: 'Garden formal',
      description: 'Cocktail hour on the terrace, followed by dinner and dancing in the barn. Shuttles back to Hudson run from 10pm.',
      rsvp: false,
    },
    {
      key: 'brunch',
      name: 'Farewell Brunch',
      start: '2027-06-13T10:00:00-04:00',
      end: '2027-06-13T12:30:00-04:00',
      venue: 'Hart Family Home',
      address: '48 Union St, Hudson, NY 12534',
      mapsQuery: '48 Union St, Hudson, NY 12534',
      dress: 'Casual',
      description: 'A relaxed send-off with coffee, bagels, and leftover cake. Come as you are.',
      rsvp: true,
    },
  ],

  // Page headings and intros. Every line here has a sensible default. Delete a line to use it.
  pages: {
    home: {
      dayHeading: 'Saturday at Clermont',
      dressNote: 'Outdoors on grass',
      stayHeading: 'We have rooms held in Hudson',
      stayText: 'Room blocks at two hotels on Warren Street, a short shuttle from the farm.',
    },
    schedule: { heading: 'The weekend', lede: 'Three days in the Hudson Valley. Come for all of it or just the main event.' },
    travel: { heading: 'Getting to Hudson', lede: 'Two hours north of the city along the river. Worth making a weekend of it.' },
    story: { heading: 'How we got here' },
    party: { heading: 'The people standing with us' },
    registry: { heading: 'Gifts' },
    faq: { heading: 'Good questions' },
    photos: { heading: 'A few of our favorites' },
    rsvp: { heading: 'Will you join us?' },
  },

  story: {
    intro: 'Seven years, three cities, one very opinionated cat. This is the short version.',
    timeline: [
      {
        date: 'October 2020',
        title: 'A borrowed umbrella',
        text: 'We met at a friend’s rooftop dinner in Brooklyn the night it rained sideways. James offered Eleanor his umbrella for the walk to the subway and then, inexplicably, walked the other way home in the rain. She texted him the next morning to return it. He suggested coffee instead.',
        image: '/images/story-1.jpg',
      },
      {
        date: 'Spring 2022',
        title: 'Two leases, one apartment',
        text: 'After a year of shuttling between Fort Greene and Crown Heights, we moved into a fourth-floor walk-up with a crooked floor and a fig tree on the fire escape. The fig tree did not survive. We did.',
        image: '/images/story-2.jpg',
      },
      {
        date: 'August 2025',
        title: 'The question',
        text: 'On a hike near Cold Spring, at the exact overlook where Eleanor once declared she would “never do this trail again,” James asked. She said yes before he finished the sentence, then made him ask it again properly.',
        image: '/images/story-3.jpg',
      },
    ],
  },

  party: [
    { name: 'Maya Hart', role: 'Maid of Honor', side: 'Eleanor', bio: 'Eleanor’s younger sister and lifelong co-conspirator.' },
    { name: 'Priya Natarajan', role: 'Bridesmaid', side: 'Eleanor', bio: 'College roommate. Still borrows Eleanor’s sweaters.' },
    { name: 'Sofia Reyes', role: 'Bridesmaid', side: 'Eleanor', bio: 'Introduced Eleanor to climbing, regrets nothing.' },
    { name: 'Daniel Okafor', role: 'Best Man', side: 'James', bio: 'James’s older brother, keeper of the embarrassing stories.' },
    { name: 'Tom Whitfield', role: 'Groomsman', side: 'James', bio: 'The friend who hosted the rooftop dinner. We owe him everything.' },
    { name: 'Andre Baptiste', role: 'Groomsman', side: 'James', bio: 'Met James in a pickup basketball game in 2014. Still plays every Sunday.' },
  ],

  travel: {
    gettingThere: [
      { name: 'By train', text: 'Amtrak runs from New York Penn Station to Hudson (HUD) in about two hours along the river. It is the easiest and prettiest way up. Book early for the Friday afternoon trains.' },
      { name: 'By car', text: 'Roughly two hours north of Manhattan via the Taconic State Parkway. There is ample free parking at the venue and at both hotels.' },
      { name: 'Flying in', text: 'Albany International (ALB) is 45 minutes north. New York’s airports (JFK, LGA, EWR) are two to three hours south and connect easily to the train.' },
    ],
    hotels: [
      {
        name: 'The Maker Hotel',
        address: '302 Warren St, Hudson, NY',
        note: 'Our room block. Walking distance to everything on Warren Street. Mention “Hart–Okafor Wedding” when booking.',
        blockCode: 'HARTOKAFOR',
        deadline: '2027-04-15',
        url: 'https://www.themaker.com',
      },
      {
        name: 'Rivertown Lodge',
        address: '731 Warren St, Hudson, NY',
        note: 'A more relaxed option a few blocks up the hill. Great coffee in the lobby.',
        blockCode: 'HARTOKAFOR',
        deadline: '2027-04-15',
        url: 'https://www.rivertownlodge.com',
      },
      {
        name: 'Rentals',
        address: 'Hudson, Germantown, Tivoli',
        note: 'Plenty of homes and cabins nearby for groups. Tivoli and Germantown are closest to the venue.',
        url: 'https://www.airbnb.com/s/Hudson--NY',
      },
    ],
    gettingAround: 'Shuttles will run between The Maker Hotel and the venue before the ceremony and after the reception. Rideshares are unreliable in the area, so please plan to take the shuttle or drive.',
    thingsToDo: [
      { name: 'Warren Street', text: 'A mile of antique shops, galleries, and very good bakeries.', url: 'https://www.gotohudson.net' },
      { name: 'Olana', text: 'Frederic Church’s hilltop home. The view alone is worth the drive.', url: 'https://www.olana.org' },
      { name: 'Hudson River hikes', text: 'Poet’s Walk in Red Hook is an easy hour with a big payoff.', url: 'https://www.scenichudson.org' },
      { name: 'Lil’ Deb’s Oasis', text: 'Our favorite dinner in town. Order the whole fish.', url: 'https://www.lildebsoasis.com' },
    ],
  },

  registry: {
    intro: 'Your presence is the present. If you would like to give something, we have set up a few options below. Nothing is expected.',
    links: [
      { name: 'Zola', note: 'Home and kitchen things, plus a honeymoon fund.', url: 'https://www.zola.com/registry' },
      { name: 'Crate & Barrel', note: 'For the apartment with the crooked floor.', url: 'https://www.crateandbarrel.com/gift-registry/' },
      { name: 'The Trevor Project', note: 'A cause close to both of us. A donation in our name means a lot.', url: 'https://www.thetrevorproject.org' },
    ],
  },

  faq: [
    { q: 'When should I RSVP by?', a: 'Please reply by April 30, 2027 so we can give the caterer a final count. You can update your response any time before then.' },
    { q: 'Can I bring a plus-one?', a: 'If your invitation includes a guest, you will see a spot to add their name when you RSVP. We are keeping the day small, so we cannot accommodate additional guests beyond that.' },
    { q: 'Are children welcome?', a: 'We love your kids, but the wedding day is adults only. Children are very welcome at the farewell brunch.' },
    { q: 'What should I wear?', a: 'Garden formal: suits, jackets, dresses of any length. The ceremony is on grass, so block heels or flats are wise. Evenings by the river can be cool, so bring a layer.' },
    { q: 'Is there parking?', a: 'Yes, free parking at the venue. That said, the bar will be open and the shuttle is easy.' },
    { q: 'Will the ceremony be outdoors?', a: 'Yes, weather permitting. In the case of rain we will move into the barn, which is just as lovely.' },
    { q: 'I have dietary restrictions. What should I do?', a: 'Let us know when you RSVP and we will make sure there is something wonderful for you.' },
    { q: 'Can I take photos during the ceremony?', a: 'We would love for you to be present with us, so we are asking for an unplugged ceremony. Our photographer will share everything after. Snap away at the reception.' },
  ],

  photos: [
    { src: '/images/gallery-1.jpg', alt: 'Morning light over the fields' },
    { src: '/images/gallery-2.jpg', alt: 'A long table set for dinner' },
    { src: '/images/gallery-3.jpg', alt: 'Mr & Mrs' },
    { src: '/images/gallery-4.jpg', alt: 'Two rings' },
    { src: '/images/gallery-5.jpg', alt: 'Cherry blossoms in April' },
    { src: '/images/gallery-6.jpg', alt: 'Poppies in the meadow' },
  ],
};
