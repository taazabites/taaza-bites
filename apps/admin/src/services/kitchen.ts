import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  writeBatch
} from "firebase/firestore"
import { db } from "../lib/firebase"
import { KitchenProductionItem, RecipeTemplate, KitchenTask, Order } from "../types"
import { auditService } from "./audit"

// Toggle for UI Stabilization phase

// Local state for mock data
let localRecipes: RecipeTemplate[] = [
  {
    id: "rec-1",
    mealName: "Grilled Chicken Salad",
    ingredients: [],
    instructions: "Grill chicken...",
    prepTime: 20,
    calories: 350,
    protein: 35,
    carbs: 15,
    fats: 12,
    packagingInstructions: "Standard bowl"
  }
];
let localTasks: KitchenTask[] = [];

// Custom error handling helper for Firestore operations
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error in Kitchen: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let localQueue: any[] = [
  { id: 'q1', orderId: 'ORD-5521', customerName: 'Amit Singh', meal: 'Paneer Bowl', mealType: 'High Protein', quantity: 2, chefAssigned: 'Chef Rahul', preparationStatus: 'Preparing', updatedAt: new Date().toISOString() },
  { id: 'q2', orderId: 'ORD-5522', customerName: 'Neha Kapoor', meal: 'Chicken Salad', mealType: 'Keto', quantity: 1, chefAssigned: 'Unassigned', preparationStatus: 'Pending', updatedAt: new Date().toISOString() },
  { id: 'q3', orderId: 'ORD-5523', customerName: 'Sanjay Dutt', meal: 'Tofu Quinoa', mealType: 'Vegan', quantity: 1, chefAssigned: 'Chef Priya', preparationStatus: 'Ready for Packing', updatedAt: new Date().toISOString() }
];

export const kitchenService = {
  /**
   * Subscribe to item-level kitchen queue
   */
  subscribeToQueue(callback: (items: any[]) => void): () => void {
    
    const q = query(collection(db, 'kitchenQueue'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  },

  /**
   * Update individual queue item status
   */
  async updateQueueStatus(id: string, preparationStatus: string): Promise<void> {
    const updatedAt = new Date().toISOString();
    
    await updateDoc(doc(db, 'kitchenQueue', id), {
      preparationStatus,
      updatedAt
    });
  },

  /**
   * Subscribe to today's kitchen production runs in real-time
   */
  subscribeToProduction(
    callback: (items: KitchenProductionItem[]) => void,
    onError: (err: any) => void
  ): () => void {
    
    const path = "kitchenProduction"
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"), limit(100))
      return onSnapshot(
        q,
        (snapshot) => {
          const items: KitchenProductionItem[] = []
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as KitchenProductionItem)
          })
          callback(items)
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path)
          onError(error)
        }
      )
    } catch (error) {
      onError(error)
      return () => {}
    }
  },

  /**
   * Subscribe to recipe templates in real-time
   */
  subscribeToRecipes(
    callback: (items: RecipeTemplate[]) => void,
    onError: (err: any) => void
  ): () => void {
    
    const path = "recipeTemplates"
    try {
      const q = query(collection(db, path), orderBy("mealName", "asc"))
      return onSnapshot(
        q,
        (snapshot) => {
          const items: RecipeTemplate[] = []
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as RecipeTemplate)
          })
          callback(items)
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path)
          onError(error)
        }
      )
    } catch (error) {
      onError(error)
      return () => {}
    }
  },

  /**
   * Subscribe to kitchen tasks in real-time
   */
  subscribeToTasks(
    callback: (items: KitchenTask[]) => void,
    onError: (err: any) => void
  ): () => void {
    
    const path = "kitchenTasks"
    try {
      const q = query(collection(db, path), orderBy("assignedAt", "desc"), limit(200))
      return onSnapshot(
        q,
        (snapshot) => {
          const items: KitchenTask[] = []
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as KitchenTask)
          })
          callback(items)
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path)
          onError(error)
        }
      )
    } catch (error) {
      onError(error)
      return () => {}
    }
  },

  /**
   * Save (create/update) a production item
   */
  async saveProductionItem(
    item: Partial<KitchenProductionItem> & { mealName: string },
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const isNew = !item.id
    const path = isNew ? "kitchenProduction" : `kitchenProduction/${item.id}`
    const now = new Date().toISOString()
    const data = {
      mealName: item.mealName,
      qtyRequired: Number(item.qtyRequired || 0),
      qtyCompleted: Number(item.qtyCompleted || 0),
      status: item.status || "Pending",
      chefId: item.chefId || "",
      chefName: item.chefName || "",
      updatedAt: now,
      ...(isNew ? { createdAt: now } : {})
    }

    

    try {
      let docId = item.id || ""
      if (isNew) {
        const docRef = await addDoc(collection(db, "kitchenProduction"), data)
        docId = docRef.id
        await auditService.logAction(
          adminId,
          adminEmail,
          "CREATE",
          `Kitchen Production ${docId}`,
          `Created production run for ${item.mealName} (Qty: ${item.qtyRequired})`
        )
      } else {
        const docRef = doc(db, "kitchenProduction", item.id!)
        await updateDoc(docRef, data)
        await auditService.logAction(
          adminId,
          adminEmail,
          "UPDATE",
          `Kitchen Production ${item.id}`,
          `Updated production run for ${item.mealName}: status ${item.status}, completed ${item.qtyCompleted}/${item.qtyRequired}`
        )
      }
      return docId
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path)
      throw error
    }
  },

  /**
   * Update production item status and automatically deduct stock from inventory if completed
   */
  async updateProductionStatusAndDeductInventory(
    itemId: string,
    mealName: string,
    qtyToComplete: number,
    newStatus: KitchenProductionItem['status'],
    chefId: string,
    chefName: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    const now = new Date().toISOString()
    
    try {
      const docRef = doc(db, "kitchenProduction", itemId)
      
      const updateData: any = {
        status: newStatus,
        updatedAt: now
      }

      if (chefId) updateData.chefId = chefId
      if (chefName) updateData.chefName = chefName

      if (newStatus === "Completed") {
        updateData.qtyCompleted = qtyToComplete
      }

      await updateDoc(docRef, updateData)

      await auditService.logAction(
        adminId,
        adminEmail,
        "UPDATE",
        `Kitchen Production ${itemId}`,
        `Marked production batch of ${mealName} (Qty: ${qtyToComplete}) as ${newStatus}`
      )

      // If status is "Completed", deduct ingredients from inventory in real-time
      if (newStatus === "Completed" && qtyToComplete > 0) {
        await this.deductIngredientsForBatch(mealName, qtyToComplete, adminId, adminEmail)
      }
    } catch (error) {
      console.error("Failed to update status & deduct inventory:", error)
      throw error
    }
  },

  /**
   * Deducts ingredients for a completed batch based on stored recipes
   */
  async deductIngredientsForBatch(
    mealName: string,
    multiplier: number,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    if (false) return;
    try {
      const now = new Date().toISOString()
      // Find the recipe template for this mealName
      const recipeQuery = query(collection(db, "recipeTemplates"), where("mealName", "==", mealName))
      const recipeSnap = await getDocs(recipeQuery)
      
      if (recipeSnap.empty) {
        console.warn(`No recipe template found for meal '${mealName}'. Skipping ingredient deduction.`)
        return
      }

      const recipeDoc = recipeSnap.docs[0]
      const recipe = recipeDoc.data() as RecipeTemplate
      
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return
      }

      const batch = writeBatch(db)
      let loggedDeductions: string[] = []

      // Fetch current ingredients items to match
      const inventorySnap = await getDocs(collection(db, "ingredients"))
      const inventoryItems = inventorySnap.docs.map(d => ({ id: d.id, ...d.data() } as any))

      for (const reqIngredient of recipe.ingredients) {
        // Find matching item in ingredients
        const invItem = inventoryItems.find(
          item => item.name.toLowerCase() === reqIngredient.ingredientName.toLowerCase()
        )

        if (invItem) {
          const totalRequiredQty = Number(reqIngredient.quantity) * multiplier
          const nextStock = Math.max(0, Number(invItem.stock) - totalRequiredQty)
          
          const invRef = doc(db, "ingredients", invItem.id)
          batch.update(invRef, { 
            stock: nextStock,
            currentStock: nextStock,
            updatedAt: now
          })

          // Add stock movement log
          const movRef = doc(collection(db, 'stockMovements'));
          batch.set(movRef, {
            ingredientId: invItem.id,
            ingredientName: invItem.name,
            type: 'Stock Out',
            movementType: 'Consumption',
            quantity: totalRequiredQty,
            unit: invItem.unit || reqIngredient.unit || 'kg',
            reason: `Kitchen Production: Prepared ${multiplier}x ${mealName}`,
            performedBy: adminEmail,
            createdAt: now
          });

          loggedDeductions.push(`${reqIngredient.ingredientName}: -${totalRequiredQty}${reqIngredient.unit || 'kg'} (New stock: ${nextStock})`)
        } else {
          console.warn(`Ingredient '${reqIngredient.ingredientName}' from recipe is not in ingredients collection.`)
        }
      }

      await batch.commit()

      if (loggedDeductions.length > 0) {
        await auditService.logAction(
          adminId,
          adminEmail,
          "UPDATE",
          "Inventory Auto-Deduction",
          `Auto-deducted raw ingredients for ${multiplier}x '${mealName}': ${loggedDeductions.join(", ")}`
        )
      }
    } catch (error) {
      console.error("Ingredient auto-deduction error:", error)
    }
  },

  /**
   * Delete a production run
   */
  async deleteProductionItem(
    id: string,
    mealName: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    try {
      await deleteDoc(doc(db, "kitchenProduction", id))
      await auditService.logAction(
        adminId,
        adminEmail,
        "DELETE",
        `Kitchen Production ${id}`,
        `Deleted production run for ${mealName}`
      )
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `kitchenProduction/${id}`)
    }
  },

  /**
   * Save a recipe template
   */
  async saveRecipeTemplate(
    recipe: Partial<RecipeTemplate> & { mealName: string },
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const isNew = !recipe.id
    const path = isNew ? "recipeTemplates" : `recipeTemplates/${recipe.id}`
    const data = {
      mealName: recipe.mealName,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || "",
      prepTime: Number(recipe.prepTime || 15),
      calories: Number(recipe.calories || 0),
      protein: Number(recipe.protein || 0),
      carbs: Number(recipe.carbs || 0),
      fats: Number(recipe.fats || 0),
      packagingInstructions: recipe.packagingInstructions || "",
      imageUrl: recipe.imageUrl || ""
    }

    

    try {
      let docId = recipe.id || ""
      if (isNew) {
        const docRef = await addDoc(collection(db, "recipeTemplates"), data)
        docId = docRef.id
        await auditService.logAction(
          adminId,
          adminEmail,
          "CREATE",
          `Recipe ${docId}`,
          `Created recipe template for '${recipe.mealName}'`
        )
      } else {
        const docRef = doc(db, "recipeTemplates", recipe.id!)
        await updateDoc(docRef, data)
        await auditService.logAction(
          adminId,
          adminEmail,
          "UPDATE",
          `Recipe ${recipe.id}`,
          `Updated recipe template for '${recipe.mealName}'`
        )
      }
      return docId
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path)
      throw error
    }
  },

  /**
   * Delete a recipe template
   */
  async deleteRecipeTemplate(
    id: string,
    mealName: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    try {
      await deleteDoc(doc(db, "recipeTemplates", id))
      await auditService.logAction(
        adminId,
        adminEmail,
        "DELETE",
        `Recipe ${id}`,
        `Deleted recipe template for '${mealName}'`
      )
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recipeTemplates/${id}`)
    }
  },

  /**
   * Save (create/update) a kitchen task
   */
  async saveKitchenTask(
    task: Partial<KitchenTask> & { staffId: string; taskDescription: string },
    adminId: string,
    adminEmail: string
  ): Promise<string> {
    const isNew = !task.id
    const path = isNew ? "kitchenTasks" : `kitchenTasks/${task.id}`
    const now = new Date().toISOString()
    const data = {
      staffId: task.staffId,
      staffName: task.staffName || "Unassigned",
      taskDescription: task.taskDescription,
      status: task.status || "Pending",
      assignedAt: task.assignedAt || now,
      ...(task.completedAt ? { completedAt: task.completedAt } : {}),
      ...(task.status === "Completed" && !task.completedAt ? { completedAt: now } : {})
    }

    

    try {
      let docId = task.id || ""
      if (isNew) {
        const docRef = await addDoc(collection(db, "kitchenTasks"), data)
        docId = docRef.id
        await auditService.logAction(
          adminId,
          adminEmail,
          "CREATE",
          `Kitchen Task ${docId}`,
          `Assigned task to chef ${task.staffName}: '${task.taskDescription}'`
        )
      } else {
        const docRef = doc(db, "kitchenTasks", task.id!)
        await updateDoc(docRef, data)
        await auditService.logAction(
          adminId,
          adminEmail,
          "UPDATE",
          `Kitchen Task ${task.id}`,
          `Updated task for ${task.staffName}: status ${task.status}`
        )
      }
      return docId
    } catch (error) {
      handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path)
      throw error
    }
  },

  /**
   * Delete a kitchen task
   */
  async deleteKitchenTask(
    id: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    
    try {
      await deleteDoc(doc(db, "kitchenTasks", id))
      await auditService.logAction(
        adminId,
        adminEmail,
        "DELETE",
        `Kitchen Task ${id}`,
        `Removed kitchen staff task`
      )
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `kitchenTasks/${id}`)
    }
  },

  /**
   * Automatically generate Today's Production plan based on active/today's orders.
   * Matches subscriptions and active orders to consolidate batch prep requirements.
   */
  async autoGenerateProduction(
    orders: Order[],
    chefs: Array<{ id: string; name: string }>,
    adminId: string,
    adminEmail: string
  ): Promise<number> {
    
    try {
      if (orders.length === 0) {
        return 0
      }

      // Consolidate orders by mealName
      const mealCounts: Record<string, { count: number; rawOrder: Order }> = {}
      for (const order of orders) {
        // Standardize getting mealName
        const mName = order.mealName || (Array.isArray(order.meals) && order.meals[0]) || (typeof order.meals === 'string' && order.meals) || 'Standard Salad'
        
        // Only count if status represents today's active pending cooking statuses
        const activeStatuses = ['Pending', 'Confirmed', 'Preparing']
        if (activeStatuses.includes(order.orderStatus || order.status || '')) {
          if (!mealCounts[mName]) {
            mealCounts[mName] = { count: 0, rawOrder: order }
          }
          mealCounts[mName].count += 1
        }
      }

      // Fetch existing production run documents to avoid duplicate entries for today
      const existingSnap = await getDocs(collection(db, "kitchenProduction"))
      const existingMeals = existingSnap.docs.map(doc => doc.data().mealName)

      let createdCount = 0
      const batch = writeBatch(db)
      const now = new Date().toISOString()

      Object.entries(mealCounts).forEach(([mName, data], index) => {
        // Skip if a production run already exists for this meal
        if (existingMeals.includes(mName)) {
          return
        }

        // Cycle through active chefs/staff to assign them tasks
        const assignedChef = chefs.length > 0 ? chefs[index % chefs.length] : null

        const docRef = doc(collection(db, "kitchenProduction"))
        batch.set(docRef, {
          mealName: mName,
          qtyRequired: data.count,
          qtyCompleted: 0,
          status: "Pending",
          chefId: assignedChef ? assignedChef.id : "",
          chefName: assignedChef ? assignedChef.name : "Unassigned",
          createdAt: now,
          updatedAt: now
        })
        createdCount++
      })

      if (createdCount > 0) {
        await batch.commit()
        await auditService.logAction(
          adminId,
          adminEmail,
          "CREATE",
          "Production Auto-Generation",
          `Auto-generated ${createdCount} consolidated meal production runs based on ${orders.length} active orders`
        )
      }

      return createdCount
    } catch (error) {
      console.error("Auto-generation of production plan failed:", error)
      throw error
    }
  },

  /**
   * Seed standard recipe templates for the core catalog
   */
  async seedStandardRecipes(adminId: string, adminEmail: string): Promise<void> {
    try {
      const snap = await getDocs(collection(db, "recipeTemplates"))
      if (!snap.empty) {
        return // Already seeded
      }

      const standardRecipes: Array<Omit<RecipeTemplate, 'id'>> = [
        {
          mealName: "Grilled Paneer Salad",
          ingredients: [
            { ingredientName: "Organic Paneer", quantity: 0.15, unit: "kg" },
            { ingredientName: "Cherry Tomatoes", quantity: 0.05, unit: "kg" },
            { ingredientName: "Lettuce Mix", quantity: 0.1, unit: "kg" },
            { ingredientName: "Olive Oil", quantity: 0.02, unit: "litres" }
          ],
          instructions: "1. Slice and grill the organic paneer with dynamic herbs.\n2. Wash and dry the organic lettuce mix and sweet cherry tomatoes.\n3. Combine ingredients in a sterile stainless steel bowl.\n4. Drizzle with extra virgin olive oil.",
          prepTime: 12,
          calories: 320,
          protein: 18,
          carbs: 8,
          fats: 22,
          packagingInstructions: "Pack salad in bio-degradable sugarcane containers with paneer hot on top. Dressing container on side.",
          imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop"
        },
        {
          mealName: "Tandoori Tofu Quinoa Bowl",
          ingredients: [
            { ingredientName: "Premium Organic Tofu", quantity: 0.18, unit: "kg" },
            { ingredientName: "Quinoa Grain", quantity: 0.08, unit: "kg" },
            { ingredientName: "Broccoli Florets", quantity: 0.1, unit: "kg" },
            { ingredientName: "Tandoori Spice Paste", quantity: 0.015, unit: "kg" }
          ],
          instructions: "1. Boil the quinoa in water with a pinch of sea salt.\n2. Marinate tofu cubes in tandoori spice and steam-bake.\n3. Lightly steam crisp broccoli florets.\n4. Layer warm quinoa as base, top with roasted tofu and broccoli.",
          prepTime: 18,
          calories: 410,
          protein: 21,
          carbs: 45,
          fats: 14,
          packagingInstructions: "Use heat-retaining round pulp boxes. Separate quinoa and broccoli sectionally.",
          imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop"
        },
        {
          mealName: "Butter Chicken Brown Rice Bowl",
          ingredients: [
            { ingredientName: "Tender Chicken Breast", quantity: 0.2, unit: "kg" },
            { ingredientName: "Brown Rice", quantity: 0.09, unit: "kg" },
            { ingredientName: "Low-fat Butter Gravy", quantity: 0.12, unit: "litres" },
            { ingredientName: "Heavy Cream", quantity: 0.01, unit: "litres" }
          ],
          instructions: "1. Sear chicken cubes in low oil until cooked.\n2. Heat low-fat butter gravy separately, fold in chicken.\n3. Steam high-fiber brown rice until tender.\n4. Top brown rice with hot chicken and butter gravy.",
          prepTime: 22,
          calories: 550,
          protein: 34,
          carbs: 48,
          fats: 18,
          packagingInstructions: "Use heavy double-walled hot packs to ensure temperature retention during dispatch.",
          imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop"
        },
        {
          mealName: "Mediterranean Chickpea Wrap",
          ingredients: [
            { ingredientName: "Whole Wheat Tortillas", quantity: 1, unit: "pcs" },
            { ingredientName: "Organic Chickpeas", quantity: 0.12, unit: "kg" },
            { ingredientName: "Hummus Dip", quantity: 0.04, unit: "kg" },
            { ingredientName: "Cucumbers", quantity: 0.05, unit: "kg" }
          ],
          instructions: "1. Drain and mash seasoned organic chickpeas slightly.\n2. Warm the whole wheat tortilla on hot grill.\n3. Spread savory hummus, layered with cucumber slices and chickpea mix.\n4. Roll tight, wrap in sterile food-grade paper.",
          prepTime: 10,
          calories: 380,
          protein: 14,
          carbs: 52,
          fats: 11,
          packagingInstructions: "Wrap tightly in greaseproof paper, slice diagonally, and place in sleeve boxes.",
          imageUrl: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&auto=format&fit=crop"
        }
      ]

      const batch = writeBatch(db)
      standardRecipes.forEach((recipe) => {
        const docRef = doc(collection(db, "recipeTemplates"))
        batch.set(docRef, recipe)
      })

      await batch.commit()
      await auditService.logAction(
        adminId,
        adminEmail,
        "CREATE",
        "Recipe Seeding",
        "Successfully seeded standard recipe templates into Firestore."
      )
    } catch (err) {
      console.error("Failed to seed recipe templates:", err)
    }
  }
}
