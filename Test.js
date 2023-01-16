const data = {
 firstName: 'Nimai',
 lastName: 'Patel',
 email: 'patel.nimai@gmail.com',
 password: 'password',
 profilePicture: 'testImagePath'
  };

  const profileData = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain',
    },
  
  };
  function run() {
    console.log('Called');
    fetch('http://localhost:3000/api/user', profileData)
    .then((response) => response.json())
    .then((data) => {
      console.log('Status: ' + "New User Saved");
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  //console.log(profileData.body);

//user.FullName = user.email;
//sub in upper SQL values from table
/*localStorage.setItem('dorm', dorm);
localStorage.setItem('diningHall', diningHall);
localStorage.setItem('major', major);
localStorage.setItem('clubs', clubs);
localStorage.setItem('study', study);
localStorage.setItem('sportingEvents', sportingEvents);
localStorage.setItem('gym', gym);
localStorage.setItem('dormWeight', dormWeight);
localStorage.setItem('diningWeight', diningWeight);
localStorage.setItem('majorWeight', majorWeight);
localStorage.setItem('clubWeight', clubWeight);
localStorage.setItem('studyWeight', studyWeight);
localStorage.setItem('sportingAttendWeight', sportingAttendWeight);
localStorage.setItem('crcWeight', crcWeight);
//use valueFill method to fill in values from SQL table */

