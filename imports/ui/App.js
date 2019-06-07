import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';

import { Tasks } from '../api/tasks.js';

import Task from './Task.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      showHideLabel: false,
      hideCompleted: false,
    };
  }
  componentDidMount () {
    // console.log('Mount', dragula)
    setTimeout(function () {
      dragula([document.getElementById('taskList')], {
				moves: function(el, container, handle) {
					return handle.classList.contains('handle')
				}
      }).on('drop', function (el) {
        var taskIds = []
        _.each($('#taskList li'), (item, index) => {
          const taskId = $(item).data('id')
          if (taskId) taskIds.push(taskId)
        })
        if (taskIds && taskIds.length) {
          Meteor.call('tasks.updateOrders', taskIds, (error, result) => {
            if (error) console.log(error);
            else console.log(result);
          })
        }
      })
    }, 1000)
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call('tasks.insert', text);

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = false; // (task.owner === currentUserId);

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    const { showForm, showHideLabel } = this.state
    return (
      <div className="container">
        <header>
          <h1>Tasks</h1>

          { showHideLabel ?
            <label className="hide-completed">
              <input
                type="checkbox"
                readOnly
                checked={this.state.hideCompleted}
                onClick={this.toggleHideCompleted.bind(this)}
              />
              Hide Completed Tasks
            </label>
            : '' }

          { showForm ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <input
                type="text"
                ref="textInput"
                placeholder="Add a task"
              />
            </form>
            : ''}
        </header>

        <ul id="taskList">
          {this.renderTasks()}
        </ul>
        {!showForm ?
          <ul>
            <li className="">
              <form id="listForm" className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Add a task"
                />
              </form>
            </li>
          </ul>
        : ''}
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { order: 1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
