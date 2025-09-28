# Drag and Drop Schedule Builder

This document describes the drag-and-drop functionality integrated into the ScheduleBuilder component.

## Features

### 1. Course Sidebar
- **Location**: Left sidebar of the schedule builder
- **Purpose**: Displays all available course offerings for the organization
- **Functionality**: 
  - Courses are draggable from the sidebar to the schedule grid
  - Shows course information including name, type, location, lecturer, and available time slots
  - Color-coded by course type (Lecture, Section, Lab, Tutorial, Seminar)
  - Includes a course type legend

### 2. Draggable Schedule Blocks
- **Location**: Within the schedule grid
- **Purpose**: Represents scheduled courses
- **Functionality**:
  - Existing scheduled courses are draggable (for future move functionality)
  - Include a remove button (X) that appears on hover
  - Show course details including name, type, location, and time

### 3. Drop Zones
- **Location**: Each time slot in the schedule grid
- **Purpose**: Accept dropped courses to add them to the schedule
- **Functionality**:
  - Visual feedback when dragging over valid drop zones
  - Prevents dropping on occupied time slots
  - Shows "Drop course here" indicator when hovering over empty slots

## Technical Implementation

### Components

1. **CourseSidebar.tsx**
   - Displays available course offerings
   - Handles drag start events
   - Uses native HTML5 drag and drop API

2. **DraggableScheduleBlock.tsx**
   - Renders scheduled courses as draggable blocks
   - Handles drag start and remove functionality
   - Provides visual feedback during drag operations

3. **ScheduleDropZone.tsx**
   - Wraps each time slot in the grid
   - Handles drag over, drag leave, and drop events
   - Provides visual feedback for valid drop zones

4. **ScheduleBuilder.tsx** (Updated)
   - Main component integrating all drag-and-drop functionality
   - Handles API calls for adding/removing courses
   - Manages state and error handling

### API Integration

- **New Endpoint**: `GET /api/v1/courses/org/{org_id}/available`
  - Returns available course offerings with their time slots
  - Used to populate the sidebar

- **Existing Endpoints**:
  - `POST /api/v1/schedules/{user_id}` - Add course to schedule
  - `DELETE /api/v1/schedules/{user_id}/courses/{scheduled_course_id}` - Remove course from schedule

### Data Flow

1. **Loading**: Component fetches available courses and current schedule
2. **Drag Start**: User drags a course from sidebar, data is stored in drag event
3. **Drag Over**: Drop zones provide visual feedback
4. **Drop**: Course is added to schedule via API call
5. **Update**: Schedule is refreshed to show new course

### Error Handling

- Schedule lock validation (prevents modification when locked)
- Time conflict detection
- API error handling with user-friendly toast messages
- Loading states for better UX

## Usage

1. **Adding Courses**:
   - Drag a course from the sidebar to an empty time slot
   - The course will be automatically scheduled if the time slot matches

2. **Removing Courses**:
   - Hover over a scheduled course block
   - Click the red X button that appears
   - Course will be removed from the schedule

3. **Visual Feedback**:
   - Blue highlight on valid drop zones
   - Cursor changes to indicate draggable items
   - Toast notifications for success/error states

## Future Enhancements

- **Move Courses**: Allow dragging scheduled courses between time slots
- **Conflict Detection**: Visual warnings for time conflicts
- **Bulk Operations**: Select multiple courses for batch operations
- **Keyboard Navigation**: Accessibility improvements
- **Mobile Support**: Touch-friendly drag and drop for mobile devices

## Dependencies

- **@hello-pangea/dnd**: Already installed but using native HTML5 drag and drop for simplicity
- **React**: Component framework
- **SWR**: Data fetching and caching
- **Tailwind CSS**: Styling
- **Lucide React**: Icons