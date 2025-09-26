import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '@/components/JobCard';
import { mockScoredJob } from '../fixtures/jobs';

describe('JobCard', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render job title', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(mockScoredJob.title)).toBeInTheDocument();
    });

    it('should render company name', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(mockScoredJob.company)).toBeInTheDocument();
    });

    it('should render location', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(mockScoredJob.location)).toBeInTheDocument();
    });

    it('should render overall score', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(`${mockScoredJob.score}`)).toBeInTheDocument();
    });

    it('should render score breakdown', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(/Location/i)).toBeInTheDocument();
      expect(screen.getByText(/Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Salary/i)).toBeInTheDocument();
      expect(screen.getByText(/Source/i)).toBeInTheDocument();
    });

    it('should render job description truncated', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const description = screen.getByText(/We are looking for/i);
      expect(description).toBeInTheDocument();
    });

    it('should display source badge', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(mockScoredJob.source)).toBeInTheDocument();
    });
  });

  describe('salary display', () => {
    it('should display salary range when available', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const salaryText = screen.getByText(/\$150k - \$200k/i);
      expect(salaryText).toBeInTheDocument();
    });

    it('should handle jobs without salary', () => {
      const jobWithoutSalary = {
        ...mockScoredJob,
        salary: undefined,
      };

      render(<JobCard job={jobWithoutSalary} onSave={mockOnSave} isSaved={false} />);

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSave when save button is clicked', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(mockScoredJob);
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('should show different UI when job is saved', () => {
      const { rerender } = render(
        <JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />
      );

      rerender(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={true} />);

      const saveButton = screen.getByRole('button', { name: /saved|remove/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should open job URL in new tab when view button clicked', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const viewButton = screen.getByRole('link', { name: /view job/i });
      expect(viewButton).toHaveAttribute('href', mockScoredJob.url);
      expect(viewButton).toHaveAttribute('target', '_blank');
    });
  });

  describe('score badges', () => {
    it('should display green badge for high scores', () => {
      const highScoreJob = {
        ...mockScoredJob,
        score: 90,
      };

      render(<JobCard job={highScoreJob} onSave={mockOnSave} isSaved={false} />);

      const badge = screen.getByText('90');
      expect(badge.className).toContain('green');
    });

    it('should display blue badge for medium scores', () => {
      const mediumScoreJob = {
        ...mockScoredJob,
        score: 70,
      };

      render(<JobCard job={mediumScoreJob} onSave={mockOnSave} isSaved={false} />);

      const badge = screen.getByText('70');
      expect(badge.className).toContain('blue');
    });

    it('should display yellow badge for low scores', () => {
      const lowScoreJob = {
        ...mockScoredJob,
        score: 50,
      };

      render(<JobCard job={lowScoreJob} onSave={mockOnSave} isSaved={false} />);

      const badge = screen.getByText('50');
      expect(badge.className).toContain('yellow');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', () => {
      render(<JobCard job={mockScoredJob} onSave={mockOnSave} isSaved={false} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      const viewLink = screen.getByRole('link', { name: /view job/i });

      expect(saveButton).toHaveAttribute('tabIndex');
      expect(viewLink).toHaveAttribute('href');
    });
  });

  describe('edge cases', () => {
    it('should handle very long job titles', () => {
      const longTitleJob = {
        ...mockScoredJob,
        title: 'Senior Software Engineer II - Full Stack Development - Remote Opportunity - Cloud Infrastructure Team - Enterprise Applications',
      };

      render(<JobCard job={longTitleJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(longTitleJob.title)).toBeInTheDocument();
    });

    it('should handle jobs with minimal data', () => {
      const minimalJob = {
        ...mockScoredJob,
        description: '',
        salary: undefined,
      };

      render(<JobCard job={minimalJob} onSave={mockOnSave} isSaved={false} />);

      expect(screen.getByText(minimalJob.title)).toBeInTheDocument();
    });
  });
});