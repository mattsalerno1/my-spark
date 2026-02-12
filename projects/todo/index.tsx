import "./tailwind.css";
import "./index.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { Checkbox } from "./components/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/card";

export const title = "To Do";
export const description =
  "Basic todo template — add, complete, and remove tasks.";

export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
};

const BUDDY_ELF_INITIAL_TODOS: TodoItem[] = [
  { id: "buddy-1", title: "Make snow angels for two hours", completed: false },
  { id: "buddy-2", title: "Go ice skating", completed: false },
  { id: "buddy-3", title: "Eat a whole roll of Tollhouse cookie dough as fast as we can", completed: false },
  { id: "buddy-4", title: "Snuggle", completed: false },
];

function TodoList() {
  const [items, setItems] = useState<TodoItem[]>(BUDDY_ELF_INITIAL_TODOS);
  const [newTitle, setNewTitle] = useState("");

  const addTodo = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        title: trimmed,
        completed: false,
      },
    ]);
    setNewTitle("");
  };

  const toggleTodo = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const removeTodo = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <nav className="flex items-center border-b border-border pb-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← All projects
          </Link>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>To do</CardTitle>
            <CardDescription>
              Add tasks, mark them done, or remove them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                className="flex-1"
              />
              <Button onClick={addTodo}>Add</Button>
            </div>

            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleTodo(item.id)}
                    aria-label={
                      item.completed ? "Mark incomplete" : "Mark complete"
                    }
                  />
                  <span
                    className={`flex-1 ${item.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {item.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeTodo(item.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            {items.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No tasks yet. Add one above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TodoList;
export const routes = [{ path: "/", Component: () => null }];
