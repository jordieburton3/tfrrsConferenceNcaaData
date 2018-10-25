import React from "react";
import { Api } from './Api/Api';

export const AppContext = React.createContext();

export class DataStore extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            conferences: []
        };
        this.getConferences = this.getConferences.bind(this);
    }

    componentDidMount() {
        this.getConferences();
    }

    render() {
        console.log(this.state);
        return <AppContext.Provider value={this.state}>
                    {this.props.children}
                 </AppContext.Provider>
    }

    async getConferences() {
        const res = await Api.getAllConferences();
        if (!res.error) {
            const conferences = res.map(result => result.conference)
            this.setState({ conferences });
        }
    }
}