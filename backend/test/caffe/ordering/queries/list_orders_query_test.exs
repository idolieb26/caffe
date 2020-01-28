defmodule Caffe.Ordering.Queries.ListOrdersQueryTest do
  use Caffe.DataCase, async: true

  test "returns the orders sorted by date desc" do
    o3 = insert!(:order, order_date: ~U[2016-05-24 13:26:08Z])
    o1 = insert!(:order, order_date: ~U[2016-05-24 13:26:06Z])
    o2 = insert!(:order, order_date: ~U[2016-05-24 13:26:07Z])

    assert_lists_equal [o3, o2, o1], list_orders(), by: :order_date
  end

  test "customers can only view their orders" do
    [cust1, cust2] = insert!(2, :customer)

    insert!(:order, customer_id: cust1.id)
    insert!(:order, customer_id: cust2.id)

    assert [cust1.id] == list_orders(cust1) |> Enum.map(& &1.customer_id)
    assert [cust2.id] == list_orders(cust2) |> Enum.map(& &1.customer_id)
  end

  defp list_orders(user \\ build(:admin), params \\ %{}) do
    Caffe.Ordering.list_orders(user, params)
  end
end
