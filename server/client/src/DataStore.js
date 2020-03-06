import React from "react";
import { Api } from './Api/Api';

export const AppContext = React.createContext();

export class DataStore extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            conferences: [],
            schoolInfo: [],
            eventInfo: [],
            selectedConferences: [],
            selectedSchools: [],
            selectedEvents: [],

        };
        this.getConferences = this.getConferences.bind(this);
        this._conferenceSelectorOnChange = this._conferenceSelectorOnChange.bind(this);
    }

    componentDidMount() {
        this.getConferences();
        this.getEventSeasonInfo();
    }

    render() {
        return <AppContext.Provider value={{
            state: this.state,
            actions: {
                conferenceSelectorOnChange: this._conferenceSelectorOnChange
            }
        }}>
                    {this.props.children}
                 </AppContext.Provider>
    }

    async getConferences() {
        const res = await Api.getAllConferences();
        if (!res.error) {
            const { conferences, schoolInfo } = res;
            console.log(res);
            this.setState({ conferences, schoolInfo });
        }
    }

    async getEventSeasonInfo() {
        const res = await Api.getEventSeasonInfo();
        if (!res.error) {
            console.log(res);
            this.setState({ eventInfo: res });
        }
    }

    _conferenceSelectorOnChange(e) {
        this.setState({ selectedConferences: e.map((selection) => selection.value) });
    }
}