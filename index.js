import { writeFile, readFileSync, unlink } from "node:fs";
import inquirer from "inquirer";
import chalk from "chalk";
import dayjs from "dayjs";

async function mainMenu() {
  const choice = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        { name: "Create a new Note", value: "create" },
        { name: "View all Notes", value: "view" },
        { name: "Delete a Note", value: "delete" },
        { name: "Update a Note", value: "update" },
        { name: "Exit", value: "exit" },
      ],
    },
  ]);

  switch (choice.action) {
    case "create":
      createNote();
      break;
    case "view":
      viewNotes();
      break;
    case "delete":
      deleteNote();
      break;
    case "update":
      updateNote();
      break;
    case "exit":
      console.log(chalk.green("Goodbye!"));
      process.exit(0);
  }
}

mainMenu();

function createNote() {
  console.log(chalk.blue("Creating a new note..."));
  inquirer
    .prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the title of the note:",
        validate: (input) => (input ? true : "Title cannot be empty"),
      },
      {
        type: "input",
        name: "content",
        message: "Enter the content of the note:",
        validate: (input) => (input ? true : "Content cannot be empty"),
      },
    ])
    .then((answers) => {
      const note = {
        title: answers.title,
        content: answers.content,
      };

      const noteMeta = {
        title: answers.title,
        time: dayjs().format("HH:mm:ss"),
        day: dayjs().format("YYYY-MM-DD"),
      };

      let checker = 0;

      const notesJson = JSON.parse(readFileSync("note.json", "utf8"));
      notesJson.forEach((noteMeta) => {
        if (noteMeta.title === note.title) {
          console.log(chalk.red("Note with this title already exists!"));
          checker = 1;
          return;
        }
      });

      if (checker === 0) {
        notesJson.push(noteMeta);
        writeFile("./notes/" + note.title + ".txt", note.content, (err) => {
          if (err) {
            console.error(chalk.red("Error creating note:", err));
          } else {
            console.log(chalk.green("Note created successfully!"));
          }
        });

        writeFile("note.json", JSON.stringify(notesJson), (err) => {
          if (err) {
            console.error(chalk.red("Error writing to file:", err));
          } else {
            console.log(chalk.green("Note metadata saved successfully!"));
          }
        });
      }
    });
}

function viewNotes() {
  console.log(chalk.blue("Showing all notes..."));
  const notesJson = JSON.parse(readFileSync("note.json", "utf8"));
  const choice = inquirer
    .prompt([
      {
        type: "list",
        name: "note",
        message: "Select a note to view:",
        choices: notesJson.map((note) => ({
          name: note.title + " " + note.day + " " + note.time,
          value: note.title,
        })),
      },
    ])
    .then((answers) => {
      const noteTitle = answers.note;
      const noteContent = readFileSync("./notes/" + noteTitle + ".txt", "utf8");
      console.log(chalk.green("Note Content:"));
      console.log(noteContent);
    });
}

function deleteNote() {
  const notesJson = JSON.parse(readFileSync("note.json", "utf8"));
  const choice = inquirer
    .prompt([
      {
        type: "list",
        name: "note",
        message: "Select a note to delete:",
        choices: notesJson.map((note) => ({
          name: note.title,
          value: note.title,
        })),
      },
    ])
    .then((answers) => {
      const noteTitle = answers.note;
      unlink("./notes/" + noteTitle + ".txt", (err) => {
        if (err) {
          console.error(chalk.red("Error deleting note:", err));
        } else {
          console.log(chalk.green("Note deleted successfully!"));
        }
      });
      const updatedNotesJson = notesJson.filter(
        (note) => note.title !== noteTitle
      );
      writeFile("note.json", JSON.stringify(updatedNotesJson), (err) => {
        if (err) {
          console.error(chalk.red("Error writing to file:", err));
        }
      });
    });
}

function updateNote() {
  const notesJson = JSON.parse(readFileSync("note.json", "utf8"));
  const choice = inquirer
    .prompt([
      {
        type: "list",
        name: "note",
        message: "Select a note to delete:",
        choices: notesJson.map((note) => ({
          name: note.title,
          value: note.title,
        })),
      },
    ])
    .then((answers) => {
        const noteTitle = answers.note;
        inquirer
            .prompt([
            {
                type: "input",
                name: "content",
                message: "Enter the new content of the note:",
                validate: (input) => (input ? true : "Content cannot be empty"),
            },
            ])
            .then((answers) => {
            writeFile(
                "./notes/" + noteTitle + ".txt",
                answers.content,
                (err) => {
                if (err) {
                    console.error(chalk.red("Error updating note:", err));
                } else {
                    console.log(chalk.green("Note updated successfully!"));
                }
                }
            );
            });
    });
}

function exit(){
    console.log(chalk.green("Goodbye!"));
    process.exit(0);
}
