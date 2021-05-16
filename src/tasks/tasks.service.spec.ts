import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task.entity';
import { NotFoundException } from '@nestjs/common';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser = {
  username: 'Test User',
  id: 1,
  salt: 'test salt',
  tasks: [],
};

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filterDto: GetTasksFilterDto = {
        search: '',
        status: TaskStatus.OPEN,
      };
      const result = await tasksService.getTasks(filterDto, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = {
        title: 'Test Task',
        description: 'Test Description',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
      expect(result).toEqual(mockTask);
    });
    it('calls taskRepository.findOne() throws error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(() => tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('create task and return the result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const createTaskDto = {
        title: 'Test Title',
        description: 'Test Description',
      };
      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result).toEqual('someTask');
    });
  });

  describe('deleteTaskById', () => {
    it('call taskService.deleteTaskById()  with a valid task', async () => {
      const argument = { id: 1, userId: mockUser.id };
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTaskById(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith(argument);
    });

    it('call taskService.deleteTaskById()  with a invalid task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await expect(() =>
        tasksService.deleteTaskById(1, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('taskService.updateTaskStatus update a valid task', async () => {
      const mockTask = {
        title: 'Test Task',
        description: 'Test Description',
        save: jest.fn().mockResolvedValue(true),
      };
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.updateTaskStatus(1, 'DONE', mockTask);
      expect(result.status).toEqual('DONE');
    });

    it('taskService.updateTaskStatus update a invalid task', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(() =>
        tasksService.updateTaskStatus(1, 'DONE', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
