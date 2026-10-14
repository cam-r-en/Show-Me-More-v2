import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FORM_OPTIONS from "../Components/form.js";
import "./Form.css";

export default function Form() {
  // Main form states for tracking user selections and inputs
  const [category, setCategory] = useState("");
  const [subcategory, setSubCategory] = useState("");
  const [subfield, setSubField] = useState("");
  const [query, setQuery] = useState([]); // List of custom text input items
  const [textInput, setTextInput] = useState("");
  // Track checkbox selections grouped by field ID (e.g., { genreTitles: [...], length: [...] })
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- DYNAMIC OPTION LOOKUPS ---
  // Find data for the currently selected main category
  const selectedCategoryData = FORM_OPTIONS.find(
    (option) => option.value === category,
  );
  // Find data for the currently selected subcategory
  const selectedSubCategoryData = selectedCategoryData?.subOptions.find(
    (subOption) => subOption.value === subcategory,
  );
  // Locate any nested subfields tied to the active radio button selection
  const subfieldSource = selectedSubCategoryData?.fields.find(
    (field) => field.subfields && field.subfields[subfield],
  );
  const selectedSubFieldData = subfieldSource?.subfields[subfield];

  // Updates local text input state and clears any active error messages
  const handleInputChange = (event) => {
    setTextInput(event.target.value);
    setError("");
  };

  // Adds a text item into the query array
  const handleAddItem = (event) => {
    if (event) event.preventDefault();
    if (textInput.trim() === "") return;

    setQuery([...query, textInput]);
    setTextInput("");
  };
  // Removes a custom text item from the query array by its index
  const handleRemoveItem = (removeIndex) => {
    setQuery(query.filter((_, index) => index !== removeIndex));
  };

  // Scoped checkbox handler: manages selections independently per field ID
  const handleCheckboxChange = (fieldId, option) => {
    setSelectedCheckboxes((prev) => {
      const currentFieldSelections = prev[fieldId] || [];
      const clearOptions = ["Doesn't Matter", "Any"];

      if (clearOptions.includes(option)) {
        // Wildcard choices stand alone in their checkbox field.
        return { ...prev, [fieldId]: [option] };
      } else {
        const filtered = currentFieldSelections.filter(
          (item) => !clearOptions.includes(item),
        );

        // Toggle the clicked option on or off
        const updatedField = filtered.includes(option)
          ? filtered.filter((item) => item !== option)
          : [...filtered, option];

        return { ...prev, [fieldId]: updatedField };
      }
    });
    setError("");
  };

  // Validates form completeness and navigates to the results page with state data
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

    const activeFieldList = selectedSubCategoryData?.fields || [];
    const hasCheckboxes = activeFieldList.some(
      (field) => field.type === "checkbox",
    );
    const hasRadioButtons = activeFieldList.some(
      (field) => field.type === "radio",
    );

    // Flatten all checkbox values across all field IDs to check if anything was selected
    const totalCheckboxSelections = Object.values(selectedCheckboxes).flat().length;
    if (hasCheckboxes && totalCheckboxSelections === 0) {
      setError("Please select at least one option");
      return;
    }

    if (hasRadioButtons && !subfield) {
      setError("Please select one of the options");
      return;
    }

    if (
      (subfield === "Similar Artists" || subfield === "Similar Albums" || subfield === "Similar Title") &&
      query.length === 0
    ) {
      setError("Please list one or more options");
      return;
    }

    if (subfield === "Something New" && totalCheckboxSelections === 0) {
      setError("Form incompleted");
      return;
    }

    setError("");
    
    // Package structured form data and pass it through React Router state to the results page
    navigate("/results", {
      state: {
        category,
        subcategory,
        subfield,
        query,
        none: selectedCheckboxes.genreTitles || [], // Genre tags passed for filtering/API calls
        lengths: selectedCheckboxes.length || [],   // Album length constraints passed for filtering
      },
    });
  };

  return (
    <div className="formPage">
      <h2 className="f-title">Show Me...</h2>

      <div className="form-container">
        {/* 1. Main Category Selection (e.g., Music, Games) */}
        <div className="mainCategorySelection">
          {FORM_OPTIONS.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="mainCategory"
                value={option.value}
                checked={category === option.value}
                onChange={(e) => {
                  // Reset downstream selections whenever the main category changes
                  setCategory(e.target.value);
                  setSubCategory("");
                  setSubField("");
                  setQuery([]);
                  setTextInput("");
                  setSelectedCheckboxes({});
                  setError("");
                }}
              />
              {option.label}
            </label>
          ))}
        </div>

        {/* 2. Subcategories Selection (e.g., Genres, Albums, Artists) */}
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
                      // Reset child choices when subcategory changes
                      setSubCategory(e.target.value);
                      setSubField("");
                      setQuery([]);
                      setTextInput("");
                      setSelectedCheckboxes({});
                      setError("");
                    }}
                  />
                  {subOption.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* 3. Primary Field Choices (Checkboxes or Radio options) */}
        {selectedSubCategoryData && (
          <div className="fieldSelection">
            {selectedSubCategoryData.fields.map((field) => (
              <div key={field.id} className="formField">
                <p>{field.label}</p>

                {field.type === "checkbox" && (
                  <div>
                    {field.options.map((option) => (
                      <label key={option}>
                        <input
                          type="checkbox"
                          id={field.id}
                          name={field.id}
                          value={option}
                          checked={(selectedCheckboxes[field.id] || []).includes(option)}
                          onChange={() => handleCheckboxChange(field.id, option)}
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

        {/* 4. Nested Subfields (e.g., Track Length selectors or Text input bars) */}
        {selectedSubFieldData && (
          <div className="subFieldSelection">
            {selectedSubFieldData.map((subfieldItem) => (
              <div key={subfieldItem.id} className="formField">
                <p>
                  <label htmlFor={subfieldItem.id}>
                    {subfieldItem.label}
                  </label>
                </p>

                {subfieldItem.type === "checkbox" && (
                  <div>
                    {subfieldItem.options.map((option) => (
                      <label key={option}>
                        <input
                          type="checkbox"
                          id={subfieldItem.id}
                          name={subfieldItem.id}
                          value={option}
                          checked={(selectedCheckboxes[subfieldItem.id] || []).includes(option)}
                          onChange={() => handleCheckboxChange(subfieldItem.id, option)}
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddItem(e);
                        }
                      }}
                    />
                    <button className="add-button" type="button" onClick={handleAddItem}>
                      ✓
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error message display banner */}
        {error && <p className="errorMessage">{error}</p>}
      </div>

      {/* Submitted Text Items List (Chips/Tags preview) */}
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
      
      {/* Navigation Buttons */}
      <Link className="homebtn" to="/">
        {"<-"} Back to Home
      </Link>
      <button className="submit" onClick={handleNavigation}>
        What You About to Get? {"->"}
      </button>
    </div>
  );
}