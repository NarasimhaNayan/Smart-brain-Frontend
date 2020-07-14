import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value:100,
      density: {
        enable: true,
        value_area:800
      }
    }
  }
}

const initialState = {
  input:'',
  imageUrl:'',
  box: {},
  route:'signin',
  isSignedIn:false,
  user: {
    id: '',
    name:'',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor(){ //constuctor to define state
    super();
    this.state = initialState;
  }

  // componentDidMount() {
  //   fetch('http://localhost:3001')
  //     .then(response => response.json())
  //     .then(console.log)
  // }

  loadUser = (data) => {
    console.log(data);
    this.setState({user: {
        id: data.id,
        name:data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image= document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width,height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box:box});
  }

  onInputChange=(event) => {
    this.setState({input: event.target.value}); //to get the value entered
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://abracadabrant-baguette-82283.herokuapp.com/imageUrl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input,  
      })
    })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch('https://abracadabrant-baguette-82283.herokuapp.com/facerecognition', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
           id: this.state.user.id,  
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count }))//to prevent from changing name to undefined we use Object.assign(target obj,{what to be extened})
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
    // console.log('click');
  }

  onRouteChange = (route)  => {
    if(route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    // const { isSignedIn, imageUrl, route, box } = this.state; 
    //if we uncomment we have to remove this.state everywhere(destructuring). 
    return (
      <div className="App">
        <Particles className= 'particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { this.state.route === 'home' 
          ? <div>
                <Logo />
                <Rank 
                  name={this.state.user.name} 
                  entries={this.state.user.entries}
                />
                <ImageLinkForm 
                  onInputChange={this.onInputChange} 
                  onButtonSubmit={this.onButtonSubmit} 
                />
                <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box}  />
            </div>
          : (
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
