// components/workout screen/TasksList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, StyleSheet,
    TouchableWithoutFeedback, Keyboard, Platform, Pressable, ScrollView
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import axios, { AxiosError } from 'axios';
import { useAuth } from '@/context/auth';
import { BASE_URL } from "@/constants/baseUrl";
import { Duration, WorkoutType } from "@/constants/types";

// --- Local Types based on API Response & Form Needs ---
interface PopulatedExercise {
    _id: string;
    name: string;
    type?: WorkoutType;
    duration: Duration;
    sets?: number;
    reps?: number;
    weight?: number;
    completed?: boolean;
    caloriesBurned?: number;
}

interface ExerciseFormData {
    name: string;
    type?: WorkoutType;
    duration: Duration;
    sets?: number;
    reps?: number;
    weight?: number;
    description?: string;
    bodyPart?: string;
    equipment?: string;
}

interface WorkoutSession {
    _id: string;
    userId: string;
    date: string;
    exercises: PopulatedExercise[];
    totalDuration?: Duration;
    totalCaloriesBurned?: number;
}

// --- Helper Functions ---
const formatDuration = (duration: Duration | undefined): string => {
    if (!duration) return "00:00";
    const minutes = String(duration.minutes || 0).padStart(2, "0");
    const seconds = String(duration.seconds || 0).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const isToday = (dateString: string): boolean => {
  const today = new Date();
  const someDate = new Date(dateString);
  return someDate.getDate() === today.getDate() &&
         someDate.getMonth() === today.getMonth() &&
         someDate.getFullYear() === today.getFullYear();
};

const defaultExerciseFormData: ExerciseFormData = {
    name: '', type: 'strength', duration: { minutes: 0, seconds: 0 },
    sets: 3, reps: 10, weight: 0, description: '', bodyPart: '', equipment: '',
};

// --- Main Component ---
const TasksList: React.FC = () => {
    // --- State ---
    const [todaysWorkout, setTodaysWorkout] = useState<WorkoutSession | null>(null);
    const [exercises, setExercises] = useState<PopulatedExercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingExercise, setEditingExercise] = useState<PopulatedExercise | null>(null);

    const { authUser, jwt } = useAuth();

    // --- Fetch Data ---
    const fetchTodaysWorkout = useCallback(async (showLoadingIndicator = true) => {
        if (!authUser?._id || !jwt) {
            setError("User not authenticated.");
            if (showLoadingIndicator) setLoading(false);
            return;
        }
        if (showLoadingIndicator) setLoading(true);
        setError(null); setSubmitError(null);
        try {
            const response = await axios.get<WorkoutSession[]>(`${BASE_URL}/workout/get/last7days/${authUser._id}`, {
                headers: { Authorization: `Bearer ${jwt}` }, timeout: 7000,
            });
            const workouts = response.data || [];
            const foundWorkout = workouts.find(workout => isToday(workout.date));
            setTodaysWorkout(foundWorkout || null);
            setExercises(foundWorkout?.exercises.map(ex => ({...ex, completed: !!ex.completed})) || []);
        } catch (err) {
             console.error("Error fetching today's workout:", err);
             const message = err instanceof AxiosError ? err.response?.data?.message || err.message || 'Failed to fetch tasks' : err instanceof Error ? err.message : 'An unexpected error occurred';
             setError(message);
             setTodaysWorkout(null); setExercises([]);
        } finally {
             if (showLoadingIndicator) setLoading(false);
        }
    }, [authUser?._id, jwt]);

    useEffect(() => {
        fetchTodaysWorkout();
    }, [fetchTodaysWorkout]);

    // --- Toggle Exercise Completion ---
    const handleToggleComplete = async (exerciseId: string) => {
        if (!jwt) { setError("Authentication error."); return; }
        const exerciseIndex = exercises.findIndex(ex => ex._id === exerciseId);
        if (exerciseIndex === -1) return;
        const currentExercise = exercises[exerciseIndex];
        const newCompletedStatus = !currentExercise.completed;
        const originalExercises = exercises.map(ex => ({...ex}));
        setExercises(prevExercises => prevExercises.map(ex => ex._id === exerciseId ? { ...ex, completed: newCompletedStatus } : ex));
        setError(null); setSubmitError(null);
        try {
            await axios.put(`${BASE_URL}/workout/update/completestatus/${exerciseId}`,
                { completed: newCompletedStatus }, { headers: { Authorization: `Bearer ${jwt}` } }
            );
            console.log(`Exercise ${exerciseId} status updated successfully.`);
        } catch (apiError) {
            console.error("Error updating exercise status:", apiError);
            setExercises(originalExercises); // Rollback
            const message = apiError instanceof AxiosError ? apiError.response?.data?.message || apiError.message : apiError instanceof Error ? apiError.message : "Failed to update task status.";
            setError(message);
        }
    };

    // --- Modal Handlers ---
    const openAddModal = () => {
        if (!todaysWorkout) { Alert.alert("Cannot Add Exercise", "No workout session found for today."); return; }
        setModalMode('add'); setEditingExercise(null); setSubmitError(null); setIsModalVisible(true);
    };
    const openEditModal = (exercise: PopulatedExercise) => {
         if (!todaysWorkout) return;
         setModalMode('edit'); setEditingExercise(exercise); setSubmitError(null); setIsModalVisible(true);
    };
    const handleCloseModal = () => {
        if (isSubmitting || isDeleting) return; // Prevent closing while busy
        setIsModalVisible(false); setEditingExercise(null); setSubmitError(null);
    };


    // --- Save Exercise (Add or Edit) ---
    const handleSaveExercise = async (formData: ExerciseFormData) => {
        if (!todaysWorkout || !jwt || isSubmitting) return; // Prevent double submit
        setIsSubmitting(true); setSubmitError(null);

        try {
            let response;
            if (modalMode === 'add') {
                // POST /workout/:workoutId/exercises
                response = await axios.post<{ workout: WorkoutSession }>(
                    `${BASE_URL}/workout/${todaysWorkout._id}/exercises`, formData,
                    { headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' } }
                );
            } else if (modalMode === 'edit' && editingExercise) {
                console.log("formData", formData);

                // PUT /workout/:workoutId/exercises/:exerciseId
                response = await axios.put<{ workout: WorkoutSession }>(
                    `${BASE_URL}/workout/${todaysWorkout._id}/exercises/${editingExercise._id}`, formData,
                    { headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' } }
                );
            } else { throw new Error("Invalid modal state"); }

  

            if (response.data?.workout?.exercises) {
                const updatedExercisesWithDefaults = response.data.workout.exercises.map(ex => ({ ...ex, completed: !!ex.completed }));
                setExercises(updatedExercisesWithDefaults);
                setTodaysWorkout(response.data.workout);
                handleCloseModal();
            } else { await fetchTodaysWorkout(false); handleCloseModal(); }
        } catch (err) {
            console.error(`Error ${modalMode === 'add' ? 'adding' : 'editing'} exercise:`, err);
            const message = err instanceof AxiosError ? err.response?.data?.message || err.message || `Failed to ${modalMode} exercise` : err instanceof Error ? err.message : 'An unexpected error occurred';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

     // --- Delete Exercise ---
     const handleDeleteExercise = async (exerciseIdToDelete: string) => {
         if (!todaysWorkout || !jwt || !exerciseIdToDelete || isDeleting) { // Prevent double delete
              setError("Cannot delete: Authentication or Exercise ID missing.");
              return;
         }

         Alert.alert(
             "Delete Exercise",
             "Are you sure you want to remove this exercise from the workout?",
             [
                 { text: "Cancel", style: "cancel" },
                 {
                     text: "Delete",
                     style: "destructive",
                     onPress: async () => {
                         setIsDeleting(exerciseIdToDelete);
                         setError(null); setSubmitError(null); // Clear other errors
                         try {
                             // DELETE /workout/:workoutId/exercises/:exerciseId
                             const response = await axios.delete<{ workout: WorkoutSession }>(
                                 `${BASE_URL}/workout/${todaysWorkout._id}/exercises/${exerciseIdToDelete}`,
                                 { headers: { Authorization: `Bearer ${jwt}` } }
                             );
                             console.log(`Exercise ${exerciseIdToDelete} deleted successfully.`);
                             if (response.data?.workout?.exercises) {
                                 const updatedExercisesWithDefaults = response.data.workout.exercises.map(ex => ({ ...ex, completed: !!ex.completed }));
                                 setExercises(updatedExercisesWithDefaults);
                                 setTodaysWorkout(response.data.workout);
                             } else {
                                 setExercises(prev => prev.filter(ex => ex._id !== exerciseIdToDelete));
                             }
                             handleCloseModal(); // Close modal after successful delete
                         } catch (apiError) {
                             console.error("Error deleting exercise:", apiError);
                             const message = apiError instanceof AxiosError ? apiError.response?.data?.message || apiError.message : apiError instanceof Error ? apiError.message : "Failed to delete exercise.";
                             // Show error in the modal if it's still open, otherwise in the list
                             if (isModalVisible && editingExercise?._id === exerciseIdToDelete) {
                                 setSubmitError(message);
                             } else {
                                 setError(message);
                             }
                         } finally {
                             setIsDeleting(null);
                         }
                     },
                 },
             ]
         );
     };


    // --- Render Logic ---
    if (loading) { return ( <View style={styles.containerCentered}><ActivityIndicator size="large" color="#FFFFFF" /><Text style={styles.loadingText}>Loading Tasks...</Text></View> ); }
    if (error && !todaysWorkout && !isSubmitting) { return ( <TouchableOpacity onPress={() => fetchTodaysWorkout()}><View style={[styles.containerCentered, styles.errorContainer]}><MaterialIcons name="error-outline" size={30} color="#FF6F61" /><Text style={styles.errorText}>{error}</Text><Text style={styles.errorDismissText}>(Tap to retry)</Text></View></TouchableOpacity> ); }
    if (!todaysWorkout) { return ( <View style={[styles.containerCentered, styles.noDataContainer]}><Ionicons name="today-outline" size={30} color="#a1a1aa" /><Text style={styles.noDataText}>No workout scheduled for today.</Text><TouchableOpacity onPress={openAddModal} style={styles.addButtonSmall}><Feather name="plus" size={20} color="#2A3445" /></TouchableOpacity></View> ); }
    if (exercises.length === 0 && !loading) { return ( <View style={[styles.containerCentered, styles.noDataContainer]}><Ionicons name="barbell-outline" size={30} color="#a1a1aa" style={{transform:[{rotate: '45deg'}]}} /><Text style={styles.noDataText}>Workout started! Add your first exercise.</Text><TouchableOpacity onPress={openAddModal} style={styles.addButtonSmall}><Feather name="plus" size={20} color="#2A3445" /></TouchableOpacity></View> );}

    return (
        <View style={styles.listContainer}>
            {error && !isSubmitting && !isDeleting && ( <TouchableOpacity onPress={() => setError(null)}><View style={styles.generalErrorContainer}><Text style={styles.generalErrorText}>{error} (Tap to dismiss)</Text></View></TouchableOpacity> )}
            <View style={styles.listItemsContainer}>
                {exercises.map((exercise: PopulatedExercise) => (
                    <Pressable key={exercise._id} onLongPress={() => openEditModal(exercise)} delayLongPress={500} style={({ pressed }) => [ styles.exerciseItemBase, pressed && styles.exerciseItemPressed ]}>
                        {/* Left Side */}
                        <View style={styles.exerciseLeft}>
                            <TouchableOpacity hitSlop={styles.hitSlop} style={[styles.checkboxBase, exercise.completed ? styles.checkboxCompleted : styles.checkboxIncomplete]} onPress={() => handleToggleComplete(exercise._id)}>
                                {exercise.completed ? <Ionicons name="checkmark-done-circle" size={24} color="#212835" /> : <View style={styles.checkboxInner} />}
                            </TouchableOpacity>
                            <View style={styles.exerciseTextContainer}>
                                <Text style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail">{exercise.name}</Text>
                                <View style={styles.durationContainerRow}>
                                    <MaterialIcons name="timer" size={14} color="#9CA3AF" />
                                    <Text style={styles.durationText}>{formatDuration(exercise.duration)}</Text>
                                </View>
                            </View>
                        </View>
                        {/* Right Side */}
                        <View style={styles.exerciseRight}>
                            <View style={styles.exerciseRightTopRow}>
                                {exercise.caloriesBurned !== undefined && exercise.caloriesBurned !== null && (<View style={styles.iconBadgeRow}><MaterialIcons name="local-fire-department" size={10} color="#FF6F61" /><Text style={styles.iconBadgeText}>{exercise.caloriesBurned} kcal</Text></View>)}
                                {/* Delete button removed from here, moved to modal */}
                            </View>
                             {(exercise.sets !== undefined || exercise.reps !== undefined) && (<Text style={styles.setsRepsText}>{exercise.sets ? `Sets ${exercise.sets}` : ''}{exercise.sets && exercise.reps ? ' x ' : ''}{exercise.reps ? `Reps ${exercise.reps}` : ''}</Text>)}
                             {exercise.weight !== undefined && exercise.weight !== null && exercise.weight > 0 && (<Text style={styles.weightText}>{exercise.weight} kg</Text>)}
                         </View>
                    </Pressable>
                ))}
            </View>
            {/* Add Button */}
             <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                 <Feather name="plus" size={24} color="#2A3445" />
             </TouchableOpacity>
             {/* Modal */}
             <ExerciseFormModal
                 isVisible={isModalVisible}
                 mode={modalMode}
                 initialData={editingExercise} // Pass the full exercise for editing context
                 onClose={handleCloseModal}
                 onSave={handleSaveExercise}
                 onDelete={handleDeleteExercise} // Pass delete handler
                 isSubmitting={isSubmitting}
                 isDeleting={isDeleting === editingExercise?._id} // Pass deleting status for this specific exercise
                 submitError={submitError}
             />
        </View>
    );
}

// --- Reusable Modal Component ---
interface ExerciseFormModalProps {
    isVisible: boolean;
    mode: 'add' | 'edit';
    initialData: ExerciseFormData | PopulatedExercise | null;
    onClose: () => void;
    onSave: (formData: ExerciseFormData) => Promise<void>;
    onDelete: (exerciseId: string) => Promise<void>; // Added onDelete prop
    isSubmitting: boolean;
    isDeleting: boolean; // Added isDeleting prop
    submitError: string | null;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
    isVisible, mode, initialData, onClose, onSave, onDelete, isSubmitting, isDeleting, submitError
}) => {
    const [formData, setFormData] = useState<ExerciseFormData>(defaultExerciseFormData);
    // Store the ID separately for delete action
    const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            if (mode === 'edit' && initialData && '_id' in initialData) { // Check if it's PopulatedExercise
                setFormData({
                    name: initialData.name || '', type: initialData.type,
                    duration: initialData.duration || { minutes: 0, seconds: 0 },
                    sets: initialData.sets, reps: initialData.reps, weight: initialData.weight,
                });
                setCurrentExerciseId(initialData._id); // Store the ID for delete
            } else {
                setFormData(defaultExerciseFormData);
                setCurrentExerciseId(null); // Clear ID for add mode
            }
        } else {
            setCurrentExerciseId(null); // Clear ID when modal closes
        }
    }, [isVisible, mode, initialData]);

    const handleInputChange = (field: keyof ExerciseFormData, value: string | number, subField?: 'minutes' | 'seconds') => {
        // ... (input change logic remains the same) ...
        setFormData(prev => {
            if (field === 'duration' && subField) {
                const numValue = Number(value) || 0;
                const nonNegativeValue = Math.max(0, numValue);
                const validSeconds = subField === 'seconds' ? Math.min(59, nonNegativeValue) : nonNegativeValue;
                return { ...prev, duration: { ...prev.duration, [subField]: validSeconds } };
            }
             if (field === 'sets' || field === 'reps' || field === 'weight') {
                 const numValue = Number(value) || 0;
                 return { ...prev, [field]: Math.max(0, numValue) };
             }
            return { ...prev, [field]: value };
        });
    };

    const handleInternalSave = () => {
        if (!formData.name.trim()) { Alert.alert("Validation Error", "Exercise name cannot be empty."); return; }
        onSave(formData);
    }

    const handleInternalDelete = () => {
        if (mode === 'edit' && currentExerciseId) {
            onDelete(currentExerciseId); // Call parent delete handler
        }
    }

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{mode === 'add' ? 'Add New Exercise' : 'Edit Exercise'}</Text>
                            {/* Delete Button - Only in Edit Mode */}
                            {mode === 'edit' && currentExerciseId && (
                                <TouchableOpacity
                                    onPress={handleInternalDelete}
                                    style={styles.modalDeleteButton}
                                    disabled={isSubmitting || isDeleting} // Disable if submitting or already deleting this item
                                >
                                     {isDeleting ? <ActivityIndicator size="small" color="#FF6F61"/> : <Ionicons name="trash-outline" size={24} color="#FF6F61" />}
                                </TouchableOpacity>
                            )}
                        </View>

                        {submitError && ( <View style={styles.modalErrorContainer}><Text style={styles.modalErrorText}>{submitError}</Text></View> )}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Form Fields... */}
                             <Text style={styles.label}>Name *</Text>
                             <TextInput style={styles.input} placeholder="e.g., Bench Press" placeholderTextColor="#9ca3af" value={formData.name} onChangeText={(text) => handleInputChange('name', text)} editable={!isSubmitting}/>
                             <Text style={styles.label}>Type</Text>
                             <TextInput style={styles.input} placeholder="strength, cardio, etc." placeholderTextColor="#9ca3af" value={formData.type || ''} onChangeText={(text) => handleInputChange('type', text)} editable={!isSubmitting}/>
                             <Text style={styles.label}>Duration *</Text>
                             <View style={styles.durationContainer}>
                                 <TextInput style={[styles.input, styles.durationInput]} placeholder="Min" placeholderTextColor="#9ca3af" keyboardType="numeric" maxLength={3} value={String(formData.duration.minutes)} onChangeText={(text) => handleInputChange('duration', text, 'minutes')} editable={!isSubmitting}/>
                                 <Text style={styles.durationSeparator}>:</Text>
                                 <TextInput style={[styles.input, styles.durationInput]} placeholder="Sec" placeholderTextColor="#9ca3af" keyboardType="numeric" maxLength={2} value={String(formData.duration.seconds)} onChangeText={(text) => handleInputChange('duration', text, 'seconds')} editable={!isSubmitting}/>
                             </View>
                             <View style={styles.row}>
                                 <View style={styles.column}><Text style={styles.label}>Sets</Text><TextInput style={styles.input} placeholder="3" placeholderTextColor="#9ca3af" keyboardType="numeric" value={String(formData.sets ?? '')} onChangeText={(text) => handleInputChange('sets', text)} editable={!isSubmitting}/></View>
                                 <View style={styles.column}><Text style={styles.label}>Reps</Text><TextInput style={styles.input} placeholder="10" placeholderTextColor="#9ca3af" keyboardType="numeric" value={String(formData.reps ?? '')} onChangeText={(text) => handleInputChange('reps', text)} editable={!isSubmitting}/></View>
                                 <View style={styles.column}><Text style={styles.label}>Weight (kg)</Text><TextInput style={styles.input} placeholder="50" placeholderTextColor="#9ca3af" keyboardType="numeric" value={String(formData.weight ?? '')} onChangeText={(text) => handleInputChange('weight', text)} editable={!isSubmitting}/></View>
                             </View>
                        </ScrollView>
                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isSubmitting || isDeleting}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton, (isSubmitting || isDeleting) && styles.buttonDisabled]} onPress={handleInternalSave} disabled={isSubmitting || isDeleting}>
                                {isSubmitting ? <ActivityIndicator color="#fff" size="small"/> : <Text style={styles.buttonText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    // Container Styles
    listContainer: { backgroundColor: 'rgba(42, 52, 69, 0.5)', borderRadius: 24, padding: 8, position: 'relative' },
    containerCentered: { backgroundColor: 'rgba(42, 52, 69, 0.5)', borderRadius: 24, padding: 16, minHeight: 120, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    noDataContainer: { minHeight: 120 },
    errorContainer: { backgroundColor: 'rgba(127, 29, 29, 0.5)', borderColor: '#ef4444', borderWidth: 1 },
    generalErrorContainer: { padding: 8, marginBottom: 8, backgroundColor: 'rgba(185, 28, 28, 0.6)', borderRadius: 6 },
    listItemsContainer: { gap: 12 },
    // Text Styles
    loadingText: { color: '#FFFFFF', textAlign: 'center', marginTop: 8 },
    errorText: { color: '#f87171', textAlign: 'center', marginTop: 8, paddingHorizontal: 16 },
    errorDismissText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
    noDataText: { color: '#a1a1aa', textAlign: 'center', marginTop: 8 },
    generalErrorText: { color: '#fecaca', textAlign: 'center', fontSize: 12 },
    exerciseName: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', flexShrink: 1 },
    durationText: { color: '#9CA3AF', marginLeft: 4, fontSize: 14 },
    setsRepsText: { color: '#9CA3AF', fontSize: 14 },
    weightText: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    iconBadgeText: { color: '#FFFFFF', fontSize: 10, marginLeft: 4 },
    // Exercise Item Styles
    exerciseItemBase: { backgroundColor: '#2A3445', borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.2)', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    exerciseItemPressed: { backgroundColor: '#3D4656' },
    exerciseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    exerciseTextContainer: { marginLeft: 16, flex: 1 },
    exerciseRight: { alignItems: 'flex-end' },
    exerciseRightTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    durationContainerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    iconBadgeRow: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    // Checkbox Styles
    checkboxBase: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    checkboxCompleted: { backgroundColor: '#63F19E' },
    checkboxIncomplete: { backgroundColor: '#687791' },
    checkboxInner: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: '#2A3445' },
    // Button Styles
    addButton: { position: 'absolute', top: -18, right: 8, backgroundColor: '#FFEBE1', padding: 8, borderRadius: 999, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
    addButtonSmall: { marginTop: 12, backgroundColor: '#FFEBE1', padding: 8, borderRadius: 999 },
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalContent: { width: '90%', maxHeight: '85%', backgroundColor: '#2A3445', borderRadius: 15, paddingHorizontal: 25, paddingTop: 15, paddingBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }, // Adjusted padding
    modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, position: 'relative', width: '100%' }, // Added header container
    modalTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#FFFFFF', marginLeft: 30 }, // Added flex: 1 and margin to center title
    modalDeleteButton: { position: 'absolute', right: -10, top: -5, padding: 10 }, // Position delete button top right
    modalErrorContainer: { backgroundColor: 'rgba(185, 28, 28, 0.7)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 15 },
    modalErrorText: { color: '#fecaca', fontSize: 14, textAlign: 'center' },
    label: { fontSize: 14, color: '#cbd5e1', marginBottom: 5, alignSelf: 'flex-start' },
    input: { backgroundColor: '#3D4656', borderRadius: 8, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 16, color: '#FFFFFF', marginBottom: 15, borderWidth: 1, borderColor: '#687791' },
    durationContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    durationInput: { flex: 1, textAlign: 'center', marginBottom: 0 },
    durationSeparator: { color: '#FFFFFF', fontSize: 18, marginHorizontal: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    column: { flex: 1, marginHorizontal: 5 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
    button: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
    saveButton: { backgroundColor: '#63F19E' },
    cancelButton: { backgroundColor: '#687791' },
    buttonDisabled: { backgroundColor: '#4a5568' },
    buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
});

export default TasksList;
