import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { DataStore } from './DataStore';
import * as serviceWorker from './serviceWorker';
import { ConnectedMeetDataSection } from './Configuration/MeetDataSection';

class TestComponent extends React.PureComponent {

    render() {
        return <div>{this.props.conferences.map((c, i) => (<div key={i}>{c}</div>))}</div>
    }
}

const ToRender = 
    <DataStore>
        <ConnectedMeetDataSection />
    </DataStore>

ReactDOM.render(ToRender, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
