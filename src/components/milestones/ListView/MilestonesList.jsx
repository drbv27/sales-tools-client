// src/components/milestones/ListView/MilestonesList.jsx
'use client';

import MilestoneItem from "./MilestoneItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import useMilestonesStore from "@/store/useMilestonesStore";
import AddMilestoneDialog from "../dialogs/AddMilestoneDialog";
import AddTaskDialog from "../dialogs/AddTaskDialog";
import EditTaskDialog from "../dialogs/EditTaskDialog";

export default function MilestonesList() {
  const { milestones, selectedLeadId } = useMilestonesStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = (milestone) => {
    setSelectedMilestone(milestone);
    setIsAddTaskOpen(true);
  };

  const handleEditTask = (task, milestoneId) => {
    console.log("Edit task triggered with:", { task, milestoneId }); // Debug
    setSelectedTask({ ...task, milestoneId }); // Incluye el milestoneId aquí
    setIsEditTaskOpen(true);
  };
  
  const filteredMilestones = milestones
  //console.log("desde list",milestones); // Debug
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Milestones</h2>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => setIsAddDialogOpen(true)} 
          className="text-primary hover:text-primary/90"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {filteredMilestones.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No milestones found for this lead/customer.
        </div>
      ) : (
        filteredMilestones.map((milestone) => (
          <MilestoneItem 
            key={milestone._id} 
            milestone={milestone} 
            onAddTask={handleAddTask} 
            onEditTask={handleEditTask} // Conexión funcional
            onToggleExpand={(id) => console.log(`Toggle milestone: ${id}`)} 
          />
        ))
      )}
      <AddMilestoneDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <AddTaskDialog
        open={isAddTaskOpen}
        milestone={selectedMilestone}
        onOpenChange={(open) => {
          setIsAddTaskOpen(open);
          if (!open) setSelectedMilestone(null);
        }}
      />
      <EditTaskDialog
        open={isEditTaskOpen}
        task={selectedTask}
        milestoneId={selectedTask?.milestoneId}
        onOpenChange={(open) => {
          setIsEditTaskOpen(open);
          if (!open) setSelectedTask(null);
        }}
      />
    </div>
  );
}
