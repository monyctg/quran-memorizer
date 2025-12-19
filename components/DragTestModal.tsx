"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Verse } from "@/lib/quranApi";
import { CheckCircle, XCircle, GripVertical } from "lucide-react";
import confetti from "canvas-confetti";

function SortableWord({ id, text }: { id: string; text: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // Added select-none to prevent text highlighting while dragging
      className={`bg-white border-2 ${
        isDragging ? "border-blue-500 shadow-xl scale-110" : "border-gray-200"
      } 
        rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing flex items-center gap-2 select-none touch-none`}
    >
      <GripVertical size={16} className="text-gray-400" />
      {/* Darker Text */}
      <span className="font-amiri text-3xl text-black pb-1">{text}</span>
    </div>
  );
}

interface DragTestModalProps {
  verses: Verse[];
  onPass: () => void;
  onCancel: () => void;
}

export default function DragTestModal({
  verses,
  onPass,
  onCancel,
}: DragTestModalProps) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [items, setItems] = useState<
    { id: string; text: string; originalIndex: number }[]
  >([]);
  const [status, setStatus] = useState<"playing" | "success" | "wrong">(
    "playing"
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (currentVerseIndex >= verses.length) return;

    const verse = verses[currentVerseIndex];
    const words = verse.words
      .filter((w) => w.char_type_name !== "end")
      .map((w, idx) => ({
        id: `${w.id}-${Math.random()}`,
        text: w.text_uthmani,
        originalIndex: idx,
      }));

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setStatus("playing");
  }, [currentVerseIndex, verses]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkAnswer = () => {
    // The logic: If visually arranged Right-to-Left, index 0 is the Rightmost item.
    // Dnd-kit + Flex-wrap handles this automatically if DOM order matches visual order.
    const isCorrect = items.every(
      (item, index) => item.originalIndex === index
    );

    if (isCorrect) {
      setStatus("success");
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      setTimeout(() => {
        if (currentVerseIndex < verses.length - 1) {
          setCurrentVerseIndex((prev) => prev + 1);
        } else {
          onPass();
        }
      }, 1500);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("playing"), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-100 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-white p-5 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-xl">
              শব্দ সাজানোর পরীক্ষা
            </h3>
            <p className="text-sm text-gray-600">
              Verse {currentVerseIndex + 1} of {verses.length}
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            সঠিক ক্রমে সাজান
          </div>
        </div>

        <div className="p-8 min-h-[350px] flex flex-col items-center justify-center gap-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items} strategy={rectSortingStrategy}>
              {/* 👇 FIXED: Added dir="rtl" and flex-wrap */}
              <div
                className="flex flex-wrap justify-center gap-4 p-6 bg-white rounded-xl w-full min-h-[200px] items-center shadow-inner border border-gray-200"
                dir="rtl"
              >
                {items.map((item) => (
                  <SortableWord key={item.id} id={item.id} text={item.text} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="h-14 w-full flex justify-center">
            {status === "success" && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-2xl animate-bounce">
                <CheckCircle size={32} /> সঠিক উত্তর!
              </div>
            )}
            {status === "wrong" && (
              <div className="flex items-center gap-2 text-red-600 font-bold text-2xl animate-shake">
                <XCircle size={32} /> ভুল হয়েছে, আবার চেষ্টা করুন!
              </div>
            )}
            {status === "playing" && (
              <button
                onClick={checkAnswer}
                className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg active:scale-95 text-lg"
              >
                চেক করুন
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border-t flex justify-between">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-red-600 font-bold text-sm"
          >
            বাতিল করুন (Cancel)
          </button>
          <span className="text-xs text-gray-400 font-bengali">
            শব্দগুলো ড্র্যাগ করে সঠিক ক্রমে সাজান
          </span>
        </div>
      </div>
    </div>
  );
}
