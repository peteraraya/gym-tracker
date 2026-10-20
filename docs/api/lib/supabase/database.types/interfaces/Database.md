[**gym-tracker**](../../../../README.md)

***

[gym-tracker](../../../../README.md) / [lib/supabase/database.types](../README.md) / Database

# Interface: Database

Defined in: [lib/supabase/database.types.ts:9](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/supabase/database.types.ts#L9)

## Properties

### public

> **public**: `object`

Defined in: [lib/supabase/database.types.ts:10](https://github.com/peteraraya/gym-tracker/blob/74372adb244d74daa6aebba3b788149270126542/lib/supabase/database.types.ts#L10)

#### Enums

> **Enums**: `object`

#### Functions

> **Functions**: `object`

#### Tables

> **Tables**: `object`

##### Tables.exercises

> **exercises**: `object`

##### Tables.exercises.Insert

> **Insert**: `object`

##### Tables.exercises.Insert.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.exercises.Insert.id?

> `optional` **id?**: `string`

##### Tables.exercises.Insert.name

> **name**: `string`

##### Tables.exercises.Insert.notes?

> `optional` **notes?**: `string`

##### Tables.exercises.Insert.order\_index

> **order\_index**: `number`

##### Tables.exercises.Insert.reps

> **reps**: `number`

##### Tables.exercises.Insert.routine\_id

> **routine\_id**: `string`

##### Tables.exercises.Insert.sets

> **sets**: `number`

##### Tables.exercises.Insert.weight?

> `optional` **weight?**: `number`

##### Tables.exercises.Row

> **Row**: `object`

##### Tables.exercises.Row.created\_at

> **created\_at**: `string`

##### Tables.exercises.Row.id

> **id**: `string`

##### Tables.exercises.Row.name

> **name**: `string`

##### Tables.exercises.Row.notes

> **notes**: `string`

##### Tables.exercises.Row.order\_index

> **order\_index**: `number`

##### Tables.exercises.Row.reps

> **reps**: `number`

##### Tables.exercises.Row.routine\_id

> **routine\_id**: `string`

##### Tables.exercises.Row.sets

> **sets**: `number`

##### Tables.exercises.Row.weight

> **weight**: `number`

##### Tables.exercises.Update

> **Update**: `object`

##### Tables.exercises.Update.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.exercises.Update.id?

> `optional` **id?**: `string`

##### Tables.exercises.Update.name?

> `optional` **name?**: `string`

##### Tables.exercises.Update.notes?

> `optional` **notes?**: `string`

##### Tables.exercises.Update.order\_index?

> `optional` **order\_index?**: `number`

##### Tables.exercises.Update.reps?

> `optional` **reps?**: `number`

##### Tables.exercises.Update.routine\_id?

> `optional` **routine\_id?**: `string`

##### Tables.exercises.Update.sets?

> `optional` **sets?**: `number`

##### Tables.exercises.Update.weight?

> `optional` **weight?**: `number`

##### Tables.routines

> **routines**: `object`

##### Tables.routines.Insert

> **Insert**: `object`

##### Tables.routines.Insert.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.routines.Insert.description?

> `optional` **description?**: `string`

##### Tables.routines.Insert.id?

> `optional` **id?**: `string`

##### Tables.routines.Insert.image\_url?

> `optional` **image\_url?**: `string`

##### Tables.routines.Insert.name

> **name**: `string`

##### Tables.routines.Insert.rest\_between\_exercises?

> `optional` **rest\_between\_exercises?**: `number`

##### Tables.routines.Insert.rest\_between\_sets?

> `optional` **rest\_between\_sets?**: `number`

##### Tables.routines.Insert.updated\_at?

> `optional` **updated\_at?**: `string`

##### Tables.routines.Insert.user\_id

> **user\_id**: `string`

##### Tables.routines.Row

> **Row**: `object`

##### Tables.routines.Row.created\_at

> **created\_at**: `string`

##### Tables.routines.Row.description

> **description**: `string`

##### Tables.routines.Row.id

> **id**: `string`

##### Tables.routines.Row.image\_url

> **image\_url**: `string`

##### Tables.routines.Row.name

> **name**: `string`

##### Tables.routines.Row.rest\_between\_exercises

> **rest\_between\_exercises**: `number`

##### Tables.routines.Row.rest\_between\_sets

> **rest\_between\_sets**: `number`

##### Tables.routines.Row.updated\_at

> **updated\_at**: `string`

##### Tables.routines.Row.user\_id

> **user\_id**: `string`

##### Tables.routines.Update

> **Update**: `object`

##### Tables.routines.Update.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.routines.Update.description?

> `optional` **description?**: `string`

##### Tables.routines.Update.id?

> `optional` **id?**: `string`

##### Tables.routines.Update.image\_url?

> `optional` **image\_url?**: `string`

##### Tables.routines.Update.name?

> `optional` **name?**: `string`

##### Tables.routines.Update.rest\_between\_exercises?

> `optional` **rest\_between\_exercises?**: `number`

##### Tables.routines.Update.rest\_between\_sets?

> `optional` **rest\_between\_sets?**: `number`

##### Tables.routines.Update.updated\_at?

> `optional` **updated\_at?**: `string`

##### Tables.routines.Update.user\_id?

> `optional` **user\_id?**: `string`

##### Tables.session\_exercises

> **session\_exercises**: `object`

##### Tables.session\_exercises.Insert

> **Insert**: `object`

##### Tables.session\_exercises.Insert.actual\_reps

> **actual\_reps**: `number`[]

##### Tables.session\_exercises.Insert.actual\_weight

> **actual\_weight**: `number`[]

##### Tables.session\_exercises.Insert.completed\_sets

> **completed\_sets**: `number`

##### Tables.session\_exercises.Insert.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.session\_exercises.Insert.exercise\_id

> **exercise\_id**: `string`

##### Tables.session\_exercises.Insert.id?

> `optional` **id?**: `string`

##### Tables.session\_exercises.Insert.session\_id

> **session\_id**: `string`

##### Tables.session\_exercises.Row

> **Row**: `object`

##### Tables.session\_exercises.Row.actual\_reps

> **actual\_reps**: `number`[]

##### Tables.session\_exercises.Row.actual\_weight

> **actual\_weight**: `number`[]

##### Tables.session\_exercises.Row.completed\_sets

> **completed\_sets**: `number`

##### Tables.session\_exercises.Row.created\_at

> **created\_at**: `string`

##### Tables.session\_exercises.Row.exercise\_id

> **exercise\_id**: `string`

##### Tables.session\_exercises.Row.id

> **id**: `string`

##### Tables.session\_exercises.Row.session\_id

> **session\_id**: `string`

##### Tables.session\_exercises.Update

> **Update**: `object`

##### Tables.session\_exercises.Update.actual\_reps?

> `optional` **actual\_reps?**: `number`[]

##### Tables.session\_exercises.Update.actual\_weight?

> `optional` **actual\_weight?**: `number`[]

##### Tables.session\_exercises.Update.completed\_sets?

> `optional` **completed\_sets?**: `number`

##### Tables.session\_exercises.Update.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.session\_exercises.Update.exercise\_id?

> `optional` **exercise\_id?**: `string`

##### Tables.session\_exercises.Update.id?

> `optional` **id?**: `string`

##### Tables.session\_exercises.Update.session\_id?

> `optional` **session\_id?**: `string`

##### Tables.workout\_sessions

> **workout\_sessions**: `object`

##### Tables.workout\_sessions.Insert

> **Insert**: `object`

##### Tables.workout\_sessions.Insert.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.workout\_sessions.Insert.date?

> `optional` **date?**: `string`

##### Tables.workout\_sessions.Insert.id?

> `optional` **id?**: `string`

##### Tables.workout\_sessions.Insert.routine\_id

> **routine\_id**: `string`

##### Tables.workout\_sessions.Insert.user\_id

> **user\_id**: `string`

##### Tables.workout\_sessions.Row

> **Row**: `object`

##### Tables.workout\_sessions.Row.created\_at

> **created\_at**: `string`

##### Tables.workout\_sessions.Row.date

> **date**: `string`

##### Tables.workout\_sessions.Row.id

> **id**: `string`

##### Tables.workout\_sessions.Row.routine\_id

> **routine\_id**: `string`

##### Tables.workout\_sessions.Row.user\_id

> **user\_id**: `string`

##### Tables.workout\_sessions.Update

> **Update**: `object`

##### Tables.workout\_sessions.Update.created\_at?

> `optional` **created\_at?**: `string`

##### Tables.workout\_sessions.Update.date?

> `optional` **date?**: `string`

##### Tables.workout\_sessions.Update.id?

> `optional` **id?**: `string`

##### Tables.workout\_sessions.Update.routine\_id?

> `optional` **routine\_id?**: `string`

##### Tables.workout\_sessions.Update.user\_id?

> `optional` **user\_id?**: `string`

#### Views

> **Views**: `object`
