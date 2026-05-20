const API_URL = "http://localhost:3000/api";

let token = localStorage.getItem("token");

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const addFieldBtn = document.getElementById("addFieldBtn");
const addActivityBtn = document.getElementById("addActivityBtn");
const addHarvestBtn = document.getElementById("addHarvestBtn");

const filterFieldsBtn = document.getElementById("filterFieldsBtn");
const clearFieldFiltersBtn = document.getElementById("clearFieldFiltersBtn");

const filterActivitiesBtn = document.getElementById("filterActivitiesBtn");
const clearActivityFiltersBtn = document.getElementById("clearActivityFiltersBtn");

const filterHarvestsBtn = document.getElementById("filterHarvestsBtn");
const clearHarvestFiltersBtn = document.getElementById("clearHarvestFiltersBtn");

function showMessage(message, type = "success") {
  authMessage.textContent = message;
  authMessage.className = `message ${type}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${escapeHTML(value)}${suffix}`;
}

function emptyState(message) {
  return `<p class="empty-state">${escapeHTML(message)}</p>`;
}

function detail(label, value, suffix = "") {
  return `
    <div class="detail">
      <strong>${escapeHTML(label)}</strong>
      <span>${displayValue(value, suffix)}</span>
    </div>
  `;
}

function showDashboard() {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}

function showAuth() {
  authSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  logoutBtn.classList.add("hidden");
}

async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// AUTH
async function login() {
  try {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage("Email and password are required.", "error");
      return;
    }

    const data = await apiRequest("/auth/login", "POST", {
      email,
      password,
    });

    token = data.token;
    localStorage.setItem("token", token);

    showMessage("Login successful.", "success");
    showDashboard();
    await loadAllData();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function register() {
  try {
    const fullName = document.getElementById("registerFullName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!fullName || !email || !password) {
      showMessage("Full name, email and password are required.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "error");
      return;
    }

    await apiRequest("/auth/register", "POST", {
      fullName,
      email,
      password,
    });

    showMessage("Registration successful. You can login now.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function logout() {
  token = null;
  localStorage.removeItem("token");
  showAuth();
}

// DASHBOARD
async function loadDashboardStats() {
  const stats = await apiRequest("/dashboard/stats");

  document.getElementById("totalFields").textContent = stats.totalFields;
  document.getElementById("totalActivities").textContent = stats.totalActivities;
  document.getElementById("totalHarvestRecords").textContent =
    stats.totalHarvestRecords;
  document.getElementById("averageYield").textContent = `${stats.averageYield} kg/ha`;
}

async function loadYieldSummary() {
  const summary = await apiRequest("/dashboard/yield-summary");
  const container = document.getElementById("yieldSummaryList");

  if (summary.length === 0) {
    container.innerHTML = emptyState("No yearly yield summary found.");
    return;
  }

  container.innerHTML = summary
    .map(
      (item) => `
      <div class="list-item">
        <div class="list-item-header">
          <div>
            <span class="eyebrow">Season ${escapeHTML(item.season_year)}</span>
            <h3>${escapeHTML(item.crop_type)}</h3>
          </div>
          <span class="badge badge-neutral">${escapeHTML(item.harvest_count)} records</span>
        </div>
        <div class="detail-grid">
          ${detail("Total Harvest", Number(item.total_harvest).toFixed(2), " kg")}
          ${detail("Average Yield", Number(item.average_yield).toFixed(2), " kg/ha")}
          ${detail("Lowest Yield", Number(item.lowest_yield).toFixed(2), " kg/ha")}
          ${detail("Highest Yield", Number(item.highest_yield).toFixed(2), " kg/ha")}
        </div>
      </div>
    `
    )
    .join("");
}

// FIELDS
async function loadFields() {
  const city = document.getElementById("filterFieldCity")?.value.trim();
  const cropType = document.getElementById("filterFieldCropType")?.value.trim();

  const params = new URLSearchParams();

  if (city) params.append("city", city);
  if (cropType) params.append("cropType", cropType);

  const queryString = params.toString();
  const endpoint = queryString ? `/fields?${queryString}` : "/fields";

  const fields = await apiRequest(endpoint);
  const container = document.getElementById("fieldsList");
  const activitySelect = document.getElementById("activityFieldId");
  const harvestSelect = document.getElementById("harvestFieldId");

  if (fields.length === 0) {
    container.innerHTML = emptyState("No fields found.");
    activitySelect.innerHTML = "<option value=''>No field available</option>";
    harvestSelect.innerHTML = "<option value=''>No field available</option>";
    return;
  }

  container.innerHTML = fields
    .map(
      (field) => `
      <div class="list-item">
        <div class="list-item-header">
          <div>
            <span class="eyebrow">Field #${escapeHTML(field.id)}</span>
            <h3>${escapeHTML(field.field_name)}</h3>
          </div>
          <span class="badge badge-neutral">${escapeHTML(field.crop_type)}</span>
        </div>
        <div class="detail-grid">
          ${detail("City", field.city)}
          ${detail("District", field.district)}
          ${detail("Area", field.field_area, " ha")}
          ${detail("Soil", field.soil_type)}
          ${detail("Description", field.description)}
        </div>
        <div class="list-actions">
          <button onclick="editField(${field.id})">Edit</button>
          <button class="danger" onclick="deleteField(${field.id})">Delete</button>
        </div>
      </div>
    `
    )
    .join("");

  const options = fields
    .map((field) => `<option value="${field.id}">${escapeHTML(field.field_name)}</option>`)
    .join("");

  activitySelect.innerHTML = options;
  harvestSelect.innerHTML = options;
}

async function addField() {
  try {
    const fieldName = document.getElementById("fieldName").value.trim();
    const city = document.getElementById("fieldCity").value.trim();
    const district = document.getElementById("fieldDistrict").value.trim();
    const cropType = document.getElementById("fieldCropType").value.trim();
    const fieldArea = document.getElementById("fieldArea").value;
    const soilType = document.getElementById("fieldSoilType").value.trim();
    const plantingDate = document.getElementById("fieldPlantingDate").value;
    const description = document.getElementById("fieldDescription").value.trim();

    if (!fieldName || !city || !cropType || !fieldArea) {
      alert("Field name, city, crop type and field area are required.");
      return;
    }

    if (Number(fieldArea) <= 0) {
      alert("Field area must be greater than zero.");
      return;
    }

    await apiRequest("/fields", "POST", {
      fieldName,
      city,
      district,
      cropType,
      fieldArea,
      soilType,
      plantingDate: plantingDate || null,
      description,
    });

    clearFieldForm();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

function clearFieldForm() {
  document.getElementById("fieldName").value = "";
  document.getElementById("fieldCity").value = "";
  document.getElementById("fieldDistrict").value = "";
  document.getElementById("fieldCropType").value = "";
  document.getElementById("fieldArea").value = "";
  document.getElementById("fieldSoilType").value = "";
  document.getElementById("fieldPlantingDate").value = "";
  document.getElementById("fieldDescription").value = "";
}

async function editField(id) {
  try {
    const field = await apiRequest(`/fields/${id}`);

    const fieldName = prompt("Field name:", field.field_name);
    if (fieldName === null) return;

    const city = prompt("City:", field.city);
    if (city === null) return;

    const district = prompt("District:", field.district || "");
    if (district === null) return;

    const cropType = prompt("Crop type:", field.crop_type);
    if (cropType === null) return;

    const fieldArea = prompt("Field area (ha):", field.field_area);
    if (fieldArea === null) return;

    const soilType = prompt("Soil type:", field.soil_type || "");
    if (soilType === null) return;

    const plantingDate = prompt(
      "Planting date (YYYY-MM-DD):",
      field.planting_date ? field.planting_date.substring(0, 10) : ""
    );
    if (plantingDate === null) return;

    const description = prompt("Description:", field.description || "");
    if (description === null) return;

    if (!fieldName || !city || !cropType || !fieldArea) {
      alert("Field name, city, crop type and field area are required.");
      return;
    }

    if (Number(fieldArea) <= 0) {
      alert("Field area must be greater than zero.");
      return;
    }

    await apiRequest(`/fields/${id}`, "PUT", {
      fieldName,
      city,
      district,
      cropType,
      fieldArea,
      soilType,
      plantingDate: plantingDate || null,
      description,
    });

    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteField(id) {
  const confirmed = confirm("Are you sure you want to delete this field?");
  if (!confirmed) return;

  try {
    await apiRequest(`/fields/${id}`, "DELETE");
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

// ACTIVITIES
async function loadActivities() {
  const activityType = document.getElementById("filterActivityType")?.value.trim();

  const params = new URLSearchParams();

  if (activityType) params.append("activityType", activityType);

  const queryString = params.toString();
  const endpoint = queryString ? `/activities?${queryString}` : "/activities";

  const activities = await apiRequest(endpoint);
  const container = document.getElementById("activitiesList");

  if (activities.length === 0) {
    container.innerHTML = emptyState("No farm activities found.");
    return;
  }

  container.innerHTML = activities
    .map(
      (activity) => `
      <div class="list-item">
        <div class="list-item-header">
          <div>
            <span class="eyebrow">Activity #${escapeHTML(activity.id)}</span>
            <h3>${escapeHTML(activity.activity_type)}</h3>
          </div>
          <span class="badge badge-neutral">${escapeHTML(formatDate(activity.activity_date))}</span>
        </div>
        <div class="detail-grid">
          ${detail("Field", activity.field_name)}
          ${detail("Field ID", activity.field_id)}
          ${detail("Cost", activity.cost)}
          ${detail("Description", activity.description)}
        </div>
        <div class="list-actions">
          <button onclick="editActivity(${activity.id})">Edit</button>
          <button class="danger" onclick="deleteActivity(${activity.id})">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function addActivity() {
  try {
    const fieldId = document.getElementById("activityFieldId").value;
    const activityType = document.getElementById("activityType").value;
    const activityDate = document.getElementById("activityDate").value;
    const cost = document.getElementById("activityCost").value;
    const description = document.getElementById("activityDescription").value.trim();

    if (!fieldId || !activityType || !activityDate) {
      alert("Field, activity type and activity date are required.");
      return;
    }

    if (Number(cost) < 0) {
      alert("Cost cannot be negative.");
      return;
    }

    await apiRequest("/activities", "POST", {
      fieldId,
      activityType,
      activityDate,
      cost: cost || 0,
      description,
    });

    clearActivityForm();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

function clearActivityForm() {
  document.getElementById("activityDate").value = "";
  document.getElementById("activityCost").value = "";
  document.getElementById("activityDescription").value = "";
}

async function editActivity(id) {
  try {
    const activity = await apiRequest(`/activities/${id}`);

    const fieldId = prompt("Field ID:", activity.field_id);
    if (fieldId === null) return;

    const activityType = prompt("Activity type:", activity.activity_type);
    if (activityType === null) return;

    const activityDate = prompt(
      "Activity date (YYYY-MM-DD):",
      activity.activity_date ? activity.activity_date.substring(0, 10) : ""
    );
    if (activityDate === null) return;

    const cost = prompt("Cost:", activity.cost || 0);
    if (cost === null) return;

    const description = prompt("Description:", activity.description || "");
    if (description === null) return;

    if (!fieldId || !activityType || !activityDate) {
      alert("Field ID, activity type and activity date are required.");
      return;
    }

    if (Number(cost) < 0) {
      alert("Cost cannot be negative.");
      return;
    }

    await apiRequest(`/activities/${id}`, "PUT", {
      fieldId,
      activityType,
      activityDate,
      cost: cost || 0,
      description,
    });

    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteActivity(id) {
  const confirmed = confirm("Are you sure you want to delete this activity?");
  if (!confirmed) return;

  try {
    await apiRequest(`/activities/${id}`, "DELETE");
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

// HARVESTS
async function loadHarvests() {
  const seasonYear = document.getElementById("filterHarvestSeasonYear")?.value.trim();
  const cropType = document.getElementById("filterHarvestCropType")?.value.trim();

  const params = new URLSearchParams();

  if (seasonYear) params.append("seasonYear", seasonYear);
  if (cropType) params.append("cropType", cropType);

  const queryString = params.toString();
  const endpoint = queryString ? `/harvests?${queryString}` : "/harvests";

  const harvests = await apiRequest(endpoint);
  const container = document.getElementById("harvestsList");

  if (harvests.length === 0) {
    container.innerHTML = emptyState("No harvest records found.");
    return;
  }

  container.innerHTML = harvests
    .map((harvest) => {
      const badgeClass =
        harvest.yield_status === "Low Yield"
          ? "badge-low"
          : harvest.yield_status === "Normal Yield"
          ? "badge-normal"
          : "badge-high";

      return `
        <div class="list-item">
          <div class="list-item-header">
            <div>
              <span class="eyebrow">Harvest #${escapeHTML(harvest.id)} - ${escapeHTML(harvest.season_year)}</span>
              <h3>${escapeHTML(harvest.crop_type)}</h3>
            </div>
            <span class="badge ${badgeClass}">${escapeHTML(harvest.yield_status)}</span>
          </div>
          <div class="detail-grid">
            ${detail("Field", harvest.field_name)}
            ${detail("Field ID", harvest.field_id)}
            ${detail("Total Harvest", `${harvest.total_harvest_amount} ${harvest.unit}`)}
            ${detail("Yield", harvest.yield_per_hectare, " kg/ha")}
            ${detail("Date", formatDate(harvest.harvest_date))}
            ${detail("Notes", harvest.notes)}
          </div>
          <div class="list-actions">
            <button onclick="editHarvest(${harvest.id})">Edit</button>
            <button class="danger" onclick="deleteHarvest(${harvest.id})">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

async function addHarvest() {
  try {
    const fieldId = document.getElementById("harvestFieldId").value;
    const cropType = document.getElementById("harvestCropType").value.trim();
    const totalHarvestAmount = document.getElementById("totalHarvestAmount").value;
    const unit = document.getElementById("harvestUnit").value.trim();
    const harvestDate = document.getElementById("harvestDate").value;
    const seasonYear = document.getElementById("seasonYear").value;
    const notes = document.getElementById("harvestNotes").value.trim();

    if (!fieldId || !cropType || !totalHarvestAmount || !harvestDate || !seasonYear) {
      alert("Field, crop type, total harvest amount, harvest date and season year are required.");
      return;
    }

    if (Number(totalHarvestAmount) <= 0) {
      alert("Total harvest amount must be greater than zero.");
      return;
    }

    await apiRequest("/harvests", "POST", {
      fieldId,
      cropType,
      totalHarvestAmount,
      unit: unit || "kg",
      harvestDate,
      seasonYear,
      notes,
    });

    clearHarvestForm();
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

function clearHarvestForm() {
  document.getElementById("harvestCropType").value = "";
  document.getElementById("totalHarvestAmount").value = "";
  document.getElementById("harvestUnit").value = "kg";
  document.getElementById("harvestDate").value = "";
  document.getElementById("seasonYear").value = "";
  document.getElementById("harvestNotes").value = "";
}

async function editHarvest(id) {
  try {
    const harvest = await apiRequest(`/harvests/${id}`);

    const fieldId = prompt("Field ID:", harvest.field_id);
    if (fieldId === null) return;

    const cropType = prompt("Crop type:", harvest.crop_type);
    if (cropType === null) return;

    const totalHarvestAmount = prompt(
      "Total harvest amount:",
      harvest.total_harvest_amount
    );
    if (totalHarvestAmount === null) return;

    const unit = prompt("Unit:", harvest.unit || "kg");
    if (unit === null) return;

    const harvestDate = prompt(
      "Harvest date (YYYY-MM-DD):",
      harvest.harvest_date ? harvest.harvest_date.substring(0, 10) : ""
    );
    if (harvestDate === null) return;

    const seasonYear = prompt("Season year:", harvest.season_year);
    if (seasonYear === null) return;

    const notes = prompt("Notes:", harvest.notes || "");
    if (notes === null) return;

    if (!fieldId || !cropType || !totalHarvestAmount || !harvestDate || !seasonYear) {
      alert("Field ID, crop type, total harvest amount, harvest date and season year are required.");
      return;
    }

    if (Number(totalHarvestAmount) <= 0) {
      alert("Total harvest amount must be greater than zero.");
      return;
    }

    await apiRequest(`/harvests/${id}`, "PUT", {
      fieldId,
      cropType,
      totalHarvestAmount,
      unit: unit || "kg",
      harvestDate,
      seasonYear,
      notes,
    });

    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteHarvest(id) {
  const confirmed = confirm("Are you sure you want to delete this harvest record?");
  if (!confirmed) return;

  try {
    await apiRequest(`/harvests/${id}`, "DELETE");
    await loadAllData();
  } catch (error) {
    alert(error.message);
  }
}

// FILTERS
function clearFieldFilters() {
  document.getElementById("filterFieldCity").value = "";
  document.getElementById("filterFieldCropType").value = "";
  loadFields();
}

function clearActivityFilters() {
  document.getElementById("filterActivityType").value = "";
  loadActivities();
}

function clearHarvestFilters() {
  document.getElementById("filterHarvestSeasonYear").value = "";
  document.getElementById("filterHarvestCropType").value = "";
  loadHarvests();
}

// HELPERS
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

async function loadAllData() {
  try {
    await loadDashboardStats();
    await loadFields();
    await loadActivities();
    await loadHarvests();
    await loadYieldSummary();
  } catch (error) {
    alert(error.message);
  }
}

// EVENT LISTENERS
loginBtn.addEventListener("click", login);
registerBtn.addEventListener("click", register);
logoutBtn.addEventListener("click", logout);

addFieldBtn.addEventListener("click", addField);
addActivityBtn.addEventListener("click", addActivity);
addHarvestBtn.addEventListener("click", addHarvest);

filterFieldsBtn.addEventListener("click", loadFields);
clearFieldFiltersBtn.addEventListener("click", clearFieldFilters);

filterActivitiesBtn.addEventListener("click", loadActivities);
clearActivityFiltersBtn.addEventListener("click", clearActivityFilters);

filterHarvestsBtn.addEventListener("click", loadHarvests);
clearHarvestFiltersBtn.addEventListener("click", clearHarvestFilters);

// INITIAL CHECK
if (token) {
  showDashboard();
  loadAllData();
} else {
  showAuth();
}
