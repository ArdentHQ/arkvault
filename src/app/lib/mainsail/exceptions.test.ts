// exceptions.test.ts
import { describe, expect, it } from 'vitest'; // Using 'it' as requested
import {
	Exception,
	NotImplemented,
	NotSupported,
	InvalidArguments,
	MissingArgument,
	ForbiddenMethodCallException,
	BadMethodDependencyException,
	BadVariableDependencyException,
	BadStateException,
	InvalidRecipientException,
} from './exceptions'; // Adjust the import path as necessary

describe('Exceptions', () => {

	describe('Exception Base Class', () => {
		const message = 'This is a custom error message.';
		let exception: Exception;

		// Use beforeEach to set up the instance for each 'it' test
		beforeEach(() => {
			exception = new Exception(message);
		});

		it('should be an instance of Error', () => {
			expect(exception).toBeInstanceOf(Error);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should have the correct message', () => {
			expect(exception.message).toBe(message);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('Exception');
		});

		it('message property should be non-enumerable', () => {
			expect(Object.getOwnPropertyDescriptor(exception, 'message')?.enumerable).toBe(false);
		});

		it('name property should be non-enumerable', () => {
			expect(Object.getOwnPropertyDescriptor(exception, 'name')?.enumerable).toBe(false);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});

		it('stack trace should contain the class name', () => {
			expect(exception.stack).toContain('Exception');
		});
	});

	describe('NotImplemented', () => {
		const klass = 'MyClass';
		const method = 'myMethod';
		let exception: NotImplemented;

		beforeEach(() => {
			exception = new NotImplemented(klass, method);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of NotImplemented', () => {
			expect(exception).toBeInstanceOf(NotImplemented);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('NotImplemented');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} is not implemented.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('NotSupported', () => {
		const klass = 'AnotherClass';
		const method = 'unsupportedMethod';
		let exception: NotSupported;

		beforeEach(() => {
			exception = new NotSupported(klass, method);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of NotSupported', () => {
			expect(exception).toBeInstanceOf(NotSupported);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('NotSupported');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} is not supported.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('InvalidArguments', () => {
		const klass = 'Service';
		const method = 'processData';
		let exception: InvalidArguments;

		beforeEach(() => {
			exception = new InvalidArguments(klass, method);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of InvalidArguments', () => {
			expect(exception).toBeInstanceOf(InvalidArguments);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('InvalidArguments');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} does not accept the given arguments.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('MissingArgument', () => {
		const klass = 'Config';
		const method = 'load';
		const argument = 'filePath';
		let exception: MissingArgument;

		beforeEach(() => {
			exception = new MissingArgument(klass, method, argument);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of MissingArgument', () => {
			expect(exception).toBeInstanceOf(MissingArgument);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('MissingArgument');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} expects the argument [${argument}] but it was not given.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('ForbiddenMethodCallException', () => {
		const klass = 'ProtectedService';
		const method = 'deleteCriticalData';
		let exception: ForbiddenMethodCallException;

		beforeEach(() => {
			exception = new ForbiddenMethodCallException(klass, method);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of ForbiddenMethodCallException', () => {
			expect(exception).toBeInstanceOf(ForbiddenMethodCallException);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('ForbiddenMethodCallException');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} cannot be called.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('BadMethodDependencyException', () => {
		const klass = 'Workflow';
		const method = 'step2';
		const dependency = 'step1';
		let exception: BadMethodDependencyException;

		beforeEach(() => {
			exception = new BadMethodDependencyException(klass, method, dependency);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of BadMethodDependencyException', () => {
			expect(exception).toBeInstanceOf(BadMethodDependencyException);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('BadMethodDependencyException');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} depends on ${klass}#${dependency} being called first.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('BadVariableDependencyException', () => {
		const klass = 'Processor';
		const method = 'calculate';
		const dependency = 'dataInitialized';
		let exception: BadVariableDependencyException;

		beforeEach(() => {
			exception = new BadVariableDependencyException(klass, method, dependency);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of BadVariableDependencyException', () => {
			expect(exception).toBeInstanceOf(BadVariableDependencyException);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('BadVariableDependencyException');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method ${klass}#${method} depends on ${klass}#${dependency} being declared first.`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('BadStateException', () => {
		const method = 'processQueue';
		const error = 'Queue is empty';
		let exception: BadStateException;

		beforeEach(() => {
			exception = new BadStateException(method, error);
		});

		it('should be an instance of Exception', () => {
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of BadStateException', () => {
			expect(exception).toBeInstanceOf(BadStateException);
		});

		it('should have the correct name', () => {
			expect(exception.name).toBe('BadStateException');
		});

		it('should have the correct message format', () => {
			expect(exception.message).toBe(`Method [${method}] has entered a bad state: ${error}`);
		});

		it('should have a stack trace', () => {
			expect(exception.stack).toBeDefined();
		});
	});

	describe('InvalidRecipientException', () => {
		it('should be an instance of Exception', () => {
			const exception = new InvalidRecipientException();
			expect(exception).toBeInstanceOf(Exception);
		});

		it('should be an instance of InvalidRecipientException', () => {
			const exception = new InvalidRecipientException();
			expect(exception).toBeInstanceOf(InvalidRecipientException);
		});

		it('should have the correct name', () => {
			const exception = new InvalidRecipientException();
			expect(exception.name).toBe('InvalidRecipientException');
		});

		it('should have an undefined message by default', () => {
			const exception = new InvalidRecipientException();
			expect(exception.message).toBe(undefined);
		});

		it('should accept a custom message', () => {
			const message = 'Recipient address is malformed.';
			const exception = new InvalidRecipientException(message);
			expect(exception.message).toBe(message);
		});

		it('should have a stack trace', () => {
			const exception = new InvalidRecipientException();
			expect(exception.stack).toBeDefined();
		});
	});
});
