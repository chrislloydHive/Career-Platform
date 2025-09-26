import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedSearchForm } from '@/components/EnhancedSearchForm';

describe('EnhancedSearchForm', () => {
  const mockOnSearch = jest.fn();
  const mockOnClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should show submit button', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /search/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'Search failed';

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={errorMessage}
          onClearError={mockOnClearError}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call onSearch with form data on submit', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);
      const submitButton = screen.getByRole('button', { name: /search/i });

      await user.type(jobTitleInput, 'Software Engineer');
      await user.type(locationInput, 'San Francisco');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Software Engineer',
            location: 'San Francisco',
          })
        );
      });
    });

    it('should not submit empty form', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should show validation error for empty query', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/job title.*required/i)).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('should disable form when loading', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={true}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      const submitButton = screen.getByRole('button', { name: /searching/i });

      expect(jobTitleInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading indicator in submit button', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={true}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument();
    });
  });

  describe('autocomplete', () => {
    it('should show job title suggestions', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'soft');

      await waitFor(() => {
        expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
      });
    });

    it('should show location suggestions', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const locationInput = screen.getByLabelText(/location/i);
      await user.type(locationInput, 'san');

      await waitFor(() => {
        expect(screen.getByText(/san francisco/i)).toBeInTheDocument();
      });
    });

    it('should select suggestion on click', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'soft');

      await waitFor(() => {
        expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
      });

      const suggestion = screen.getByText(/software engineer/i);
      await user.click(suggestion);

      expect(jobTitleInput).toHaveValue('Software Engineer');
    });
  });

  describe('salary filter', () => {
    it('should show salary range options', async () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const salaryToggle = screen.getByText(/salary filter/i);
      fireEvent.click(salaryToggle);

      await waitFor(() => {
        expect(screen.getByLabelText(/minimum salary/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/maximum salary/i)).toBeInTheDocument();
      });
    });

    it('should include salary in search criteria', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'Software Engineer');

      const salaryToggle = screen.getByText(/salary filter/i);
      fireEvent.click(salaryToggle);

      const minSalary = screen.getByLabelText(/minimum salary/i);
      await user.type(minSalary, '100000');

      const submitButton = screen.getByRole('button', { name: /search/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            query: 'Software Engineer',
            salary: expect.objectContaining({
              min: 100000,
            }),
          })
        );
      });
    });
  });

  describe('error handling', () => {
    it('should clear error on input change', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error="Previous error"
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      await user.type(jobTitleInput, 'Software');

      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('should show dismiss button for errors', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error="Search failed"
          onClearError={mockOnClearError}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <EnhancedSearchForm
          onSearch={mockOnSearch}
          isLoading={false}
          error={null}
          onClearError={mockOnClearError}
        />
      );

      const jobTitleInput = screen.getByLabelText(/job title/i);
      const locationInput = screen.getByLabelText(/location/i);

      jobTitleInput.focus();
      await user.keyboard('Software Engineer');
      await user.tab();
      expect(locationInput).toHaveFocus();
    });
  });
});