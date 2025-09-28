# ScheduleBuilder Component

A React component for managing weekly course schedules with a visual grid interface similar to the Ibn al-Haytham system.

## Features

### Visual Schedule Grid
- **Weekly Layout**: Days of the week (Sunday to Saturday) as rows
- **Time Intervals**: 55-minute time slots from 8:30 AM to 4:45 PM as columns
- **Responsive Design**: Horizontal scroll for mobile devices
- **Grid System**: CSS Grid-based layout for precise positioning

### Course Block Rendering
- **Dynamic Width**: Course blocks span multiple columns based on duration
- **Color Coding**: Different background colors for course types:
  - Blue: Lectures
  - Green: Sections
  - Purple: Labs
  - Orange: Tutorials
  - Pink: Seminars
- **Rich Information**: Displays course name, type, location, and time
- **Hover Effects**: Interactive blocks with shadow transitions

### Data Integration
- **API Integration**: Fetches schedule data from `/api/v1/schedules/{userId}`
- **Real-time Updates**: Uses SWR for data fetching and caching
- **Error Handling**: Comprehensive error states and loading indicators
- **Type Safety**: Full TypeScript support with proper interfaces

### Schedule Management
- **Lock/Unlock**: Toggle schedule modification permissions
- **Course Summary**: Detailed view of all scheduled courses
- **Empty State**: User-friendly message when no courses are scheduled
- **Legend**: Visual guide for course type colors

## Component Structure

### Main Components
1. **ScheduleBuilder**: Main container component
2. **ScheduleGrid**: Grid layout with time slots and days
3. **ScheduleBlock**: Individual course block component

### Key Functions
- `getTimeSlotIndex()`: Maps time strings to grid column indices
- `getColumnSpan()`: Calculates block width based on course duration
- `handleToggleLock()`: Manages schedule lock status

## API Integration

### Data Flow
1. Component mounts and fetches user schedule via SWR
2. Schedule data is transformed into grid coordinates
3. Course blocks are rendered in appropriate grid positions
4. Real-time updates through SWR mutation

### Error Handling
- Loading states with skeleton UI
- Error messages for API failures
- Graceful degradation for missing data

## Styling

### Design System
- Uses existing Learn House UI components (Button, Badge, Table)
- Consistent with project's Tailwind CSS configuration
- Responsive breakpoints for mobile/desktop
- Accessible color contrasts and hover states

### Grid Layout
- CSS Grid with 8 columns (1 for day labels, 7 for time slots)
- Dynamic row heights based on content
- Proper spacing and borders for visual clarity

## Usage

```tsx
import ScheduleBuilder from '@components/Dashboard/Pages/Schedule/ScheduleBuilder'

function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScheduleBuilder />
    </div>
  )
}
```

## Navigation

The ScheduleBuilder is accessible via:
- Dashboard navigation menu (Calendar icon)
- Direct route: `/orgs/[orgslug]/schedule`
- Requires authentication and organization context

## Drag & Drop Features (IMPLEMENTED)

### Core Functionality
- **@dnd-kit Integration**: Modern drag and drop using @dnd-kit/core and @dnd-kit/sortable
- **Draggable Course Blocks**: Existing scheduled courses can be dragged within the grid
- **Available Courses Sidebar**: Displays unscheduled courses that can be dragged onto the schedule
- **Visual Drop Zones**: Time slots highlight when valid drop targets
- **Real-time API Integration**: Changes are automatically saved to the backend

### Drag & Drop Capabilities
- **Add Courses**: Drag from Available Courses sidebar to empty time slots
- **Move Courses**: Drag existing courses to different time slots (basic implementation)
- **Visual Feedback**: Drag overlays and drop zone highlighting
- **Conflict Prevention**: Validates time slot availability before allowing drops
- **Touch Support**: Works on mobile and tablet devices

### Available Courses Sidebar
- **Course Filtering**: Automatically filters out already scheduled courses
- **Course Information**: Shows course name, type, lecturer, location, and available times
- **Color Coding**: Matches schedule grid color scheme for course types
- **Responsive Layout**: Sidebar adapts to screen size

### Technical Implementation
- **DndContext**: Wraps the entire schedule component
- **Draggable Blocks**: Schedule blocks and course cards are draggable
- **Droppable Zones**: Time slots accept course drops
- **State Management**: Manages drag state and updates schedule
- **API Integration**: Calls addCourseToSchedule and removeCourseFromSchedule

## Future Enhancements

### Additional Features
- **Advanced Course Moving**: Direct time slot to time slot course movement
- **Batch Operations**: Select and move multiple courses at once
- **Undo/Redo**: Action history for schedule changes
- **Export**: Download schedule as PDF/image
- **Print View**: Optimized layout for printing
- **Smart Scheduling**: AI-powered schedule optimization

### Technical Improvements
- **Performance**: Virtual scrolling for large schedules
- **Accessibility**: Screen reader support and keyboard navigation
- **Mobile**: Touch-friendly interactions
- **Offline**: PWA support with offline capabilities

## Dependencies

### Core
- React 18+ with hooks
- Next.js 13+ with app router
- TypeScript for type safety

### UI Libraries
- Tailwind CSS for styling
- Radix UI components
- Lucide React for icons
- SWR for data fetching

### State Management
- React Context for user/organization data
- SWR for server state management
- React hooks for local state

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch device support
- Progressive enhancement approach
