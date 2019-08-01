defmodule Caffe.Orders.Projections.TabsProjector do
  use Commanded.Projections.Ecto, name: "Orders.Projection.TabsProjector", consistency: :strong

  alias Ecto.Multi

  alias Caffe.Orders.Events.{TabOpened, DrinksOrdered, FoodOrdered}
  alias Caffe.Orders.Projections.{Tab, TabItem}

  project %TabOpened{tab_id: id, table_number: table_number}, fn multi ->
    Multi.insert(multi, :tab, %Tab{id: id, table_number: table_number})
  end

  project %DrinksOrdered{tab_id: tab_id, items: items}, fn multi ->
    insert_tab_items(multi, items, tab_id)
  end

  project %FoodOrdered{tab_id: tab_id, items: items}, fn multi ->
    insert_tab_items(multi, items, tab_id)
  end

  defp insert_tab_items(multi, items, tab_id) do
    Enum.reduce(items, multi, fn item, multi ->
      tab_item = Map.put(struct(TabItem, item), :tab_id, tab_id)
      Multi.insert(multi, :tab, tab_item)
    end)
  end
end
