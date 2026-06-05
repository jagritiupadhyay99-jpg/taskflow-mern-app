const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const { validateTask } = require('../middleware/validate');

// Protected route: Get all tasks for an authenticated user (with search, filter, pagination)
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const { search, status, priority, sort, page = 1, limit = 6 } = req.query;
    
    // Search/filter query building based on user input
    const query = { userId: req.user.id };

    // Search filter (regex search on title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // default
    if (sort) {
      if (sort === 'oldest') sortOptions = { createdAt: 1 };
      else if (sort === 'dueDate_asc') sortOptions = { dueDate: 1 };
      else if (sort === 'dueDate_desc') sortOptions = { dueDate: -1 };
      else if (sort === 'title_asc') sortOptions = { title: 1 };
      else if (sort === 'title_desc') sortOptions = { title: -1 };
    }

    // Calculate records to skip for pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limitNum);

    res.json({
      tasks,
      totalTasks,
      totalPages,
      currentPage: pageNum
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, validateTask, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const newTask = new Task({
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      userId: req.user.id
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this task' });
    }

    const { title, description, status, priority, dueDate } = req.body;
    
    // Updates
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    task = await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task successfully removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
