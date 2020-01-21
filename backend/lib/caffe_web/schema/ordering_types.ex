defmodule CaffeWeb.Schema.OrderingTypes do
  use Absinthe.Schema.Notation

  alias CaffeWeb.Resolvers
  alias CaffeWeb.Schema.Middleware
  alias Caffe.Authorization.Authorizer

  object :order do
    field :id, :id
    field :customer, :user
    field :customer_id, :integer
    field :state, :string
    field :order_amount, :decimal
    field :items, list_of(:order_item)
    field :notes, :string
    field :order_date, :datetime
    field :code, :string, resolve: &Resolvers.Ordering.order_code/3
    field :viewer_can_cancel, :boolean, resolve: can?(:cancel_order)
  end

  object :order_item do
    field :menu_item_id, :id
    field :menu_item_name, :string
    field :quantity, :integer
    field :price, :decimal
    field :state, :string
    field :viewer_can_serve, :boolean, resolve: can?(:serve_item)
  end

  object :stats do
    field :order_count, :integer
    field :amount_earned, :decimal
  end

  object :activity do
    field :id, :id
    field :type, :string
    field :actor, :user
    field :object_id, :string
    field :object_type, :string
    field :published, :datetime
  end

  input_object :order_item_input do
    field :menu_item_id, non_null(:id)
    field :quantity, non_null(:integer)
  end

  object :ordering_mutations do
    field :place_order, :order do
      arg :items, non_null(list_of(non_null(:order_item_input)))
      arg :notes, :string
      middleware Middleware.Authorize, :place_order
      resolve &Resolvers.Ordering.place_order/3
    end

    field :mark_items_served, :string do
      arg :order_id, non_null(:id)
      arg :item_ids, non_null(list_of(non_null(:id)))
      middleware Middleware.Authorize, :mark_items_served
      resolve &Resolvers.Ordering.mark_items_served/3
    end

    field :begin_food_preparation, :string do
      arg :order_id, non_null(:id)
      arg :item_ids, non_null(list_of(non_null(:id)))
      middleware Middleware.Authorize, :begin_food_preparation
      resolve &Resolvers.Ordering.begin_food_preparation/3
    end

    field :mark_food_prepared, :string do
      arg :order_id, non_null(:id)
      arg :item_ids, non_null(list_of(non_null(:id)))
      middleware Middleware.Authorize, :mark_food_prepared
      resolve &Resolvers.Ordering.mark_food_prepared/3
    end

    field :pay_order, :string do
      arg :order_id, non_null(:id)
      arg :amount_paid, non_null(:decimal)
      middleware Middleware.Authorize, :pay_order
      resolve &Resolvers.Ordering.pay_order/3
    end

    field :cancel_order, :string do
      arg :order_id, non_null(:id)
      middleware Middleware.Authorize, :cancel_order
      resolve &Resolvers.Ordering.cancel_order/3
    end
  end

  object :ordering_queries do
    field :order, :order do
      arg :id, :id
      middleware Middleware.Authorize, :get_order
      resolve &Resolvers.Ordering.get_order/3
    end

    field :orders, list_of(:order) do
      middleware Middleware.Authorize, :list_orders
      resolve &Resolvers.Ordering.list_orders/3
    end

    field :kitchen_orders, list_of(:order) do
      middleware Middleware.Authorize, :list_kitchen_orders
      resolve &Resolvers.Ordering.list_kitchen_orders/3
    end

    field :waitstaff_orders, list_of(:order) do
      middleware Middleware.Authorize, :list_waitstaff_orders
      resolve &Resolvers.Ordering.list_waitstaff_orders/3
    end

    field :stats, :stats do
      arg :since, :datetime
      middleware Middleware.Authorize, :get_stats
      resolve &Resolvers.Ordering.get_stats/3
    end

    field :activities, list_of(:activity) do
      middleware Middleware.Authorize, :get_activity_feed
      resolve &Resolvers.Ordering.get_activity_feed/3
    end
  end

  object :ordering_subscriptions do
    field :new_order, :order do
      config fn _args, %{context: context} ->
        case context[:current_user] do
          %{role: "customer", id: id} -> {:ok, topic: id}
          %{role: _} -> {:ok, topic: "*"}
          _ -> {:error, :unauthorized}
        end
      end

      trigger :place_order, topic: fn order -> [order.customer_id, "*"] end
    end
  end

  defp can?(action) do
    fn
      parent, _, %{context: %{current_user: user}} ->
        {:ok, Authorizer.authorize?(action, user, parent)}

      _, _, _ ->
        {:ok, false}
    end
  end
end
