# Schedule Builder with Drag-and-Drop

This implementation integrates @dnd-kit for modern drag-and-drop functionality in the ScheduleBuilder component.

## Features

### 1. **Draggable Course Blocks**
- Existing scheduled courses can be dragged around the schedule grid
- Visual feedback during dragging with hover states and shadows
- Preserves course information during drag operations

### 2. **Sidebar with Available Courses**
- Shows unscheduled course offerings that can be dragged onto the schedule
- Each course card displays:
  - Course name and type
  - Instructor name
  - Location
  - Available time slots
- Color-coded by course type (Lecture, Lab, Seminar, etc.)

### 3. **Droppable Grid Cells**
- Each time slot in the schedule grid accepts dropped courses
- Visual indicators when hovering over valid drop zones
- Shows "Drop here" message for empty slots
- Shows "Slot occupied" warning for filled slots

### 4. **Real-time Visual Feedback**
- Drag overlay shows course information during dragging
- Drop zones highlight with blue border for valid drops
- Red highlighting for occupied slots
- Smooth animations and transitions

### 5. **API Integration**
- Connects to existing scheduling API endpoints:
  - `addCourseToSchedule` - Adds new courses from sidebar
  - `removeCourseFromSchedule` - Removes courses when moved
  - `getAvailableCourseOfferings` - Fetches available courses (mock data currently)

### 6. **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- Proper ARIA attributes

## Components

### `ScheduleBuilder.tsx`
Main component that orchestrates the drag-and-drop functionality:
- Manages DndContext for drag operations
- Handles drag start, drag over, and drag end events
- Integrates with existing schedule management
- Shows/hides sidebar based on schedule lock status

### `CoursesSidebar.tsx`
Sidebar component displaying available courses:
- Lists draggable course offerings
- Shows course details and available time slots
- Color-coded course type indicators
- Loading states and empty states

### `DroppableCell`
Individual grid cell component that accepts drops:
- Handles drop zone highlighting
- Shows visual feedback during drag operations
- Manages occupied/empty state display

### `DraggableScheduleBlock`
Enhanced version of existing schedule blocks:
- Makes scheduled courses draggable
- Maintains visual consistency with original design
- Provides drag handles and hover states

## Usage

```tsx
import ScheduleBuilder from './ScheduleBuilder'

// The component automatically handles all drag-and-drop functionality
<ScheduleBuilder />
```

## Dependencies

- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable interactions
- `@dnd-kit/utilities` - Helper utilities
- `@dnd-kit/modifiers` - Movement restrictions

## Future Enhancements

1. **Real API Integration**: Replace mock data with actual course offerings endpoint
2. **Time Conflict Detection**: Prevent scheduling conflicts automatically
3. **Bulk Operations**: Select and move multiple courses at once
4. **Schedule Templates**: Save and load schedule templates
5. **Export Functionality**: Export schedules to calendar formats
6. **Mobile Optimization**: Improve touch interactions for mobile devices

## Notes

- The schedule sidebar is hidden when the schedule is locked
- Mock data is currently used for available courses - replace `getAvailableCourseOfferings` with real API when available
- Visual feedback includes rotation and opacity changes during dragging
- All drag operations integrate with existing SWR cache invalidation