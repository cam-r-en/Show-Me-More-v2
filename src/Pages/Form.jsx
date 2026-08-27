import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FORM_OPTIONS from "../Components/form.js";
import "./Form.css";

export default function Form() {
  const [category, setCategory] = useState(""); //Main categories (Music, Games, Movies, etc.)
  const [subcategory, setSubCategory] = useState(""); //Subcategories (Genres, Artists, Arthurs, etc.)
  const [subfield, setSubField] = useState(""); //Extra questions
  const [query, setQuery] = useState([]); //Array for text input responses
  const [textInput, setTextInput] = useState(""); //Text input
  const [none, setNone] = useState([]); //Clear checklist if "Doesn't Matter" is selected
  const [error, setError] = useState(""); //If the form is not completed
  const navigate = useNavigate();

  //Find Main Category items in form.js
  const selectedCategoryData = FORM_OPTIONS.find(
    (option) => option.value === category,
  );
  //When category is selected display subcategories
  const selectedSubCategoryData = selectedCategoryData?.subOptions.find(
    (subOption) => subOption.value === subcategory,
  );
  //If other questions are available, display them
  const subfieldSource = selectedSubCategoryData?.fields.find(
    (field) => field.subfields && field.subfields[subfield],
  );
  const selectedSubFieldData = subfieldSource?.subfields[subfield];

  //Update text state
  const handleInputChange = (event) => {
    setTextInput(event.target.value);
    setError("");
  };

  //Append the new text to the array on button click
  const handleAddItem = (event) => {
    if (event) {
      event.preventDefault(); // Prevents page reload if used inside a form
    }
    if (textInput.trim() === "") return; // Avoid adding empty entries

    // Always use a new array (spreading) to update state cleanly
    setQuery([...query, textInput]);
    setTextInput(""); // Reset the input box to empty
  };

  const handleRemoveItem = (removeIndex) => {
    setQuery(query.filter((_, index) => index !== removeIndex));
  };

  const handleCheckboxChange = (id) => {
    if (id === "Doesn't Matter") {
      // If "Doesn't Matter" is checked, clear everything else and only keep "Doesn't Matter"
      setNone(["Doesn't Matter"]);
    } else {
      // If a regular option is checked
      setNone((prevSelected) => {
        // Remove "Doesn't Matter" if it was previously active
        const filtered = prevSelected.filter(
          (item) => item !== "Doesn't Matter",
        );

        if (filtered.includes(id)) {
          // Uncheck the regular option if it was already selected
          return filtered.filter((item) => item !== id);
        } else {
          // Check the regular option
          return [...filtered, id];
        }
      });
      setError("");
    }
  };

  const handleNavigation = (event) => {
    event.preventDefault();

    if (!category) {
      setError("No option was selected yet");
      return;
    }

    if (!subcategory) {
      setError("Form incompleted");
      return;
    }

    // Find the currently active field configuration
    const activeFieldList = selectedSubCategoryData?.fields || [];

    // Check if the current subcategory expects checkboxes or radio buttons
    const hasCheckboxes = activeFieldList.some(
      (field) => field.type === "checkbox",
    );
    const hasRadioButtons = activeFieldList.some(
      (field) => field.type === "radio",
    );

    // If it's a checkbox area (like Genres), ensure at least one box is checked
    if (hasCheckboxes && none.length === 0) {
      setError("Please select at least one option");
      return;
    }

    // If it's a radio button area (like Artists/Albums), ensure an option is selected
    if (hasRadioButtons && !subfield) {
      setError("Please select one of the options");
      return;
    }

    // Validate text inputs for specific subfield choices
    if (subfield === "Similar Artists" || subfield === "Similar Albums") {
      if (query.length === 0) {
        setError("Please list one or more options");
        return;
      }
    }

    // Validate "Something New" checkbox requirement
    if (subfield === "Something New" && none.length === 0) {
      setError("Form incompleted");
      return;
    }

    setError("");
    navigate("/results", {
      state: {
        category: category,
        subcategory: subcategory,
        subfield: subfield,
        query: query,
        none: none,
      },
    });
  };

  return (
    <div className="formPage">
      <h2>...</h2>

      <form onSubmit={handleAddItem}>
        {/* Main Category Selection */}
        <div className="mainCategorySelection">
          {FORM_OPTIONS.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="mainCategory"
                value={option.value}
                checked={category === option.value}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory("");
                  setSubField("");
                  setQuery([]);
                  setTextInput("");
                  setError("");
                }}
              />
              {option.label}
            </label>
          ))}
        </div>

        {/* Subcategories - Only show once a category is selected */}
        {category && <h1 className="cate">{category}</h1>}
        {selectedCategoryData && (
          <div className="subCategorySelection">
            {selectedCategoryData.subOptions.map((subOption) => (
              <div key={subOption.value} className="formSubCategory">
                <label>
                  <input
                    type="radio"
                    name="subCategory"
                    value={subOption.value}
                    checked={subcategory === subOption.value}
                    onChange={(e) => {
                      setSubCategory(e.target.value);
                      setSubField("");
                      setQuery([]);
                      setTextInput("");
                      setError("");
                    }}
                  />
                  {subOption.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Choices - Only show once a subcategory is selected */}
        {selectedSubCategoryData && (
          <div className="fieldSelection">
            {selectedSubCategoryData.fields.map((field) => (
              <div key={field.id} className="formField">
                <p htmlFor={field.id}>{field.label}</p>
                {field.type === "checkbox" && (
                  <div>
                    {field.options.map((option) => (
                      <label key={option}>
                        <input
                          type="checkbox"
                          id={field.id}
                          name={field.id}
                          value={option}
                          checked={none.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {field.type === "radio" && (
                  <div>
                    {field.options.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          id={field.id}
                          name={field.id}
                          value={option}
                          checked={subfield === option}
                          onChange={(e) => {
                            setSubField(e.target.value);
                            setError("");
                          }}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Subfields - Only show if a subcategory field has subfields */}
        {selectedSubFieldData && (
          <div>
            {selectedSubFieldData.map((subfieldItem) => (
              <div key={subfieldItem.id} className="formField">
                <label htmlFor={subfieldItem.id}>{subfieldItem.label}</label>
                {subfieldItem.type === "checkbox" && (
                  <div>
                    {subfieldItem.options.map((option) => (
                      <label key={option}>
                        <input
                          type="checkbox"
                          id={subfieldItem.id}
                          name={subfieldItem.id}
                          value={option}
                          checked={none.includes(option)}
                          onChange={() => handleCheckboxChange(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {subfieldItem.type === "text" && (
                  <div className="textInputField">
                    <input
                      type="text"
                      id={subfieldItem.id}
                      name={subfieldItem.id}
                      value={textInput}
                      onChange={handleInputChange}
                      placeholder={subfieldItem.label}
                    />
                    <button type="submit">Add Item</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {error && <p className="errorMessage">{error}</p>}
        <Link className="submit" to="/results" onClick={handleNavigation}>
          What You About to Get?
        </Link>
      </form>

      {query.length > 0 && (
        <div className="submittedItems">
          <h3>Similar to...</h3>
          <ul>
            {query.map((item, index) => (
              <li key={index} className="submittedItem">
                <span>{item}</span>
                <button
                  type="button"
                  className="removeItemButton"
                  onClick={() => handleRemoveItem(index)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link className="homebtn" to="/">
        Back to Home
      </Link>
    </div>
  );
}
