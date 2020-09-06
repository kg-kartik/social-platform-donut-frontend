import React, { Component } from "react";
import "./TicketDashboard.scss";
import Axios from "axios";
import Moment from "react-moment";
import { connect } from "react-redux";
import { setUpSocket } from "./socket";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import NewTicketEditor from "./NewTicketEditor";
import socket from "../../dashboard/utils/socket";
import { BASE_URL } from "../../../actions/baseApi";
import TicketDisscussion from "./TicketDiscussions";
import TicketContent from "./TicketContent/TicketContent";
import { getTickets } from "../../../actions/ticketAction";
import donutIcon from "../../../assets/svgs/donut-icon.svg";
import Navigation from "../../dashboard/navigation/navigation";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import { Drawer, List, ListItem, ListItemText } from "@material-ui/core";
import NotificationsNoneOutlinedIcon from "@material-ui/icons/NotificationsNoneOutlined";

class TicketDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "all",
      ticket: true,
      all: [],
      open: [],
      pending: [],
      onHold: [],
      solved: [],
      closed: [],
      socket: socket,
      notifications: [],
      editorMode: false,
      viewingTicket: null,
      notificationDrawer: false,
    };
  }

  toggleDrawer = () => {
    this.setState((state) => {
      return {
        notificationDrawer: !state.notificationDrawer,
      };
    });
  };

  addToNotification = (notification) => {
    this.setState({
      notifications: [notification, ...this.state.notifications],
    });
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.tickets.tickets);
    this.setState({
      all: nextProps.tickets.tickets,
    });
  }

  divideAsPerStatus = () => {
    this.setState({
      open: this.state.all.filter((ele) => ele.genres.indexOf("OPEN") !== -1),
      pending: this.state.all.filter(
        (ele) => ele.genres.indexOf("PENDING") !== -1
      ),
      onHold: this.state.all.filter(
        (ele) => ele.genres.indexOf("ON_HOLD") !== -1
      ),
      solved: this.state.all.filter(
        (ele) => ele.genres.indexOf("SOLVED") !== -1
      ),
      closed: this.state.all.filter(
        (ele) => ele.genres.indexOf("CLOSED") !== -1
      ),
    });
  };

  componentDidMount() {
    setTimeout(() => {
      this.props.getTickets();
    });
    this.divideAsPerStatus();
    this.getTicketNotifications();
    setUpSocket(this.state, donutIcon, this.addToNotification);
  }

  handleSearchBarChange = (e) => {};

  handleViewChange = (atrb) => {
    this.setState({
      view: atrb,
    });
  };

  toggleNewTicketEditor = (open) => {
    this.setState({
      editorMode: open,
    });
  };

  getTicketNotifications = async () => {
    const notifications = (
      await Axios.get(`${BASE_URL}/notification/ticket/user/all`)
    ).data.notifications;
    this.setState({ notifications });
  };

  handleCreateNewTicket = async (newTicket) => {
    console.log("EXECUTED!");
    const ticket = (await Axios.post(`${BASE_URL}/ticket`, newTicket)).data
      .ticket;
    ticket.comments = 0;
    this.setState({
      all: [...this.state.all, ticket],
      open: [...this.state.open, ticket],
      editorMode: false,
    });
  };

  handleViewTicket = (id) => {
    this.setState({
      viewingTicket: id,
    });
  };

  render() {
    console.log(this.state.notifications);
    const { view } = this.state;
    return (
      <div className="ticket">
        <div className="navigation">
          <Navigation ticket={this.state.ticket} />
        </div>
        <div className="ticket-details" id="ticket-shadow">
          <div className="ticket-description">
            <div className="dashboard-title">
              Tickets
              <Button variant="light" onClick={this.toggleDrawer}>
                <NotificationsNoneOutlinedIcon />
              </Button>
            </div>
            {!this.state.editorMode &&
              this.state.all.length &&
              !this.state.viewingTicket && (
                <React.Fragment>
                  <div className="searchbar-container">
                    <div className="searchbar">
                      <span className="searchbar-icon">
                        <SearchOutlinedIcon />
                      </span>
                      <Form>
                        <Form.Control
                          as="input"
                          placeholder="Search Tickets"
                          onChange={this.handleSearchBarChange}
                        />
                      </Form>
                    </div>
                    <Button onClick={() => this.toggleNewTicketEditor(true)}>
                      New Ticket
                    </Button>
                  </div>
                  <div className="ticket-status">
                    <div className="tabs__container">
                      <span className="nav__tab container">
                        <ul className="nav__list__container">
                          {[
                            { view: "all", opt: "All Tickets" },
                            { view: "open", opt: "Open" },
                            { view: "pending", opt: "Pending" },
                            { view: "onHold", opt: "On Hold" },
                            { view: "solved", opt: "Solved" },
                            { view: "closed", opt: "Closed" },
                          ].map((ele, index) => (
                            <li
                              key={index}
                              className={
                                view === ele.view
                                  ? "nav__single__tab selected"
                                  : "nav__single__tab"
                              }
                              onClick={() => this.handleViewChange(ele.view)}
                            >
                              {ele.opt}
                            </li>
                          ))}
                        </ul>
                      </span>
                    </div>
                  </div>
                  <div className="ticket-content">
                    <TicketContent
                      viewTicket={this.handleViewTicket}
                      tickets={this.state[this.state.view]}
                    />
                  </div>
                </React.Fragment>
              )}
            {this.state.editorMode && !this.state.viewingTicket && (
              <NewTicketEditor
                save={this.handleCreateNewTicket}
                cancel={() => this.toggleNewTicketEditor(false)}
              />
            )}
            {this.state.viewingTicket && (
              <TicketDisscussion
                currentUser={this.props.user}
                ticketId={this.state.viewingTicket}
                back={this.handleViewTicket}
              />
            )}
          </div>
        </div>
        <Drawer
          anchor={"right"}
          open={this.state.notificationDrawer}
          PaperProps={{ style: { position: "absolute", zIndex: "5000" } }}
          BackdropProps={{ style: { position: "absolute", zIndex: "5000" } }}
          ModalProps={{
            container: document.getElementById("ticket-shadow"),
            style: { position: "absolute", zIndex: "5000" },
          }}
          variant="temporary"
          onClose={this.toggleDrawer}
        >
          <List className="list">
            {this.state.notifications.map((notification) => (
              <ListItem style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
                <div>{notification.tag}</div>
                <div>{notification.heading}</div>
                <div>
                  <Moment date={notification.createdAt} durationFromNow/>
                </div>
                <div>{notification.content}</div>
                <hr></hr>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </div>
    );
  }
}

// map state to props
const mapStateToProps = (state) => ({
  tickets: state.tickets,
  user: state.user,
});

export default connect(mapStateToProps, { getTickets })(TicketDashboard);

// {
//   id: 1,
//   title: "Requirement of new Integration",
//   year: "1988",
//   runtime: "92",
//   genres: ["open"],
//   director: "Tim Burton",
//   actors: "Alec Baldwin, Geena Davis, Annie McEnroe, Maurice Page",
//   plot:
//     "We require a new integration for slack. I would really appreciate it if some of the developers could look into this matter! Please feel free to reach out to me for more information regarding this!. I would be glad to help!",
//   posterUrl:
//     "https://images-na.ssl-images-amazon.com/images/M/MV5BMTUwODE3MDE0MV5BMl5BanBnXkFtZTgwNTk1MjI4MzE@._V1_SX300.jpg",
// }
